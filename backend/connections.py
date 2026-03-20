import time, re
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def fetch_vierp_data(creds, status_callback=lambda p, m: None):
    if not creds:
        status_callback(0, "Error: Missing credentials")
        return None

    target_year = str(creds.get('year', '2025-26')).strip()
    target_sem  = str(creds.get('semester', '2')).strip()

    data = {"attendance_html": "", "timetable_html": ""}

    with sync_playwright() as p:
        try:
            status_callback(5, "Initializing Browser...")
            browser = p.chromium.launch(headless=True, args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ])
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            # ==========================================
            # 1. AUTHENTICATION
            # ==========================================
            status_callback(15, "Navigating to VIERP Portal...")
            page.goto("https://learner.vierp.in/login", wait_until="networkidle", timeout=60000)

            try:
                user_input = page.locator("input.v-field__input[type='text']").first
                user_input.wait_for(state="visible", timeout=12000)
                user_input.fill(creds['username'], timeout=2000)
                page.locator("input.v-field__input[type='password']").first.fill(creds['password'], timeout=2000)
                page.locator("button[type='submit']").click(force=True, timeout=2000)
            except:
                raise Exception("Authentication Failed! Invalid Email Configuration.")

            try:
                page.wait_for_url(re.compile(r".*dashboard.*", re.IGNORECASE), timeout=3500)
            except:
                raise Exception("Authentication Failed! Double check your Email and Password in Settings.")

            # ==========================================
            # 2. ATTENDANCE MODULE
            # ==========================================
            status_callback(40, "Loading Attendance Module...")
            page.goto("https://learner.vierp.in/attendance")
            page.wait_for_selector(".v-field__append-inner", state="visible", timeout=20000)
            time.sleep(0.5)
            page.reload(wait_until="networkidle")
            page.wait_for_selector(".v-field__append-inner", state="visible", timeout=20000)
            time.sleep(1)

            def _pick(field_index: int, value: str):
                chevrons = page.locator(".v-select__menu-icon").all()
                if len(chevrons) <= field_index:
                    raise Exception(f"Dropdown chevron[{field_index}] not found")
                chevrons[field_index].click()
                page.wait_for_selector(".v-overlay-container .v-list-item", state="visible", timeout=10000)
                time.sleep(0.3)
                item = page.locator(".v-overlay-container .v-list-item").filter(
                    has=page.locator(".v-list-item-title", has_text=re.compile(rf"^\s*{re.escape(value)}\s*$"))
                ).first
                item.wait_for(state="visible", timeout=5000)
                item.click()
                time.sleep(0.5)

            try:
                status_callback(50, f"Setting Year/Sem: {target_year} / Sem {target_sem}")
                _pick(0, target_year)
                _pick(1, target_sem)
                status_callback(60, f"Fetching {target_year} Sem {target_sem} attendance...")
                page.locator("button", has_text=re.compile(r"Fetch", re.IGNORECASE)).first.click(force=True)
                time.sleep(3)
                page.wait_for_load_state("networkidle", timeout=25000)
                time.sleep(2)
                data["attendance_html"] = page.content()
            except:
                pass

            # ==========================================
            # 3. TIMETABLE MODULE
            # ==========================================
            status_callback(70, "Loading Timetable Module...")
            page.goto("https://learner.vierp.in/mytimetable")
            page.wait_for_selector(".v-field__append-inner", state="visible", timeout=20000)
            time.sleep(0.5)
            page.reload(wait_until="networkidle")
            page.wait_for_selector(".v-field__append-inner", state="visible", timeout=20000)
            time.sleep(1)

            try:
                status_callback(80, f"Setting Year/Sem: {target_year} / Sem {target_sem}")
                _pick(0, target_year)
                _pick(1, target_sem)
                status_callback(90, f"Fetching {target_year} Sem {target_sem} timetable...")
                fetch_btn = page.locator("button", has_text=re.compile(r"Fetch", re.IGNORECASE)).first
                if fetch_btn.is_visible():
                    fetch_btn.click(force=True)
                    time.sleep(3)
                    page.wait_for_load_state("networkidle", timeout=25000)
                    time.sleep(2)
                data["timetable_html"] = page.content()
            except:
                pass

            status_callback(100, "Sync Complete!")
            browser.close()
            return data

        except Exception as e:
            status_callback(0, f"Error: {str(e)}")
            try: browser.close()
            except: pass
            return None


def parse_attendance(html):
    if not html: return []
    soup = BeautifulSoup(html, 'html.parser')
    res = []
    for card in soup.find_all('div', class_='overview-panel'):
        if "Overall Attendance" in card.text: continue
        try:
            name = card.find('div', class_='pb-5').get_text(separator=' ', strip=True)
            ctype = "Theory"
            chip = card.find('div', class_='v-chip__content')
            if chip: ctype = chip.get_text(strip=True).split('-')[0].strip()
            for span in card.find_all('span'):
                if '/' in span.text:
                    p = span.get_text(strip=True).split('/')
                    res.append({"name": f"{name} ({ctype})", "type": ctype, "attended": int(p[0]), "conducted": int(p[1])})
                    break
        except: continue
    return res


def parse_timetable(html):
    sched = {d: [] for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]}
    if not html: return sched
    try:
        soup = BeautifulSoup(html, 'html.parser')
        days = list(sched.keys())
        table = soup.find('tbody')
        if not table: return sched
        for row in table.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) < 2: continue
            time_slot = cols[0].text.strip()
            for i in range(1, 7):
                if i < len(cols):
                    for c in cols[i].find_all('div', class_='timetable-card'):
                        details = [d.text.strip() for d in c.find_all('div') if d.text.strip() and not d.has_attr('class')]
                        if len(details) >= 3:
                            sched[days[i-1]].append({
                                "time": time_slot,
                                "teacher": details[0],
                                "subject": details[1].split(':')[0],
                                "type": details[2]
                            })
    except: pass
    return sched