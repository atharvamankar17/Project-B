import math

def calculate_subject_stats(subject_name, attended, conducted, class_type, target=0.75):
    try:
        if conducted == 0:
            return {"name": subject_name, "type": class_type, "attended": 0, "conducted": 0, "percentage": 0.0, "status": "unknown", "margin": 0, "message": "No classes yet.", "sort_weight": 99}
        current_pct = attended / conducted
        pct_display = round(current_pct * 100, 2)
        if current_pct < target:
            status, sort_weight = "critical", (1 if "lab" in class_type.lower() else 2)
            margin = math.ceil(((target * conducted) - attended) / (1 - target))
            msg = f"Critical: Attend {margin} more."
        elif target <= current_pct <= 0.80:
            status, sort_weight = "borderline", (3 if "lab" in class_type.lower() else 4)
            margin = math.floor((attended - (target * conducted)) / target)
            msg = f"Borderline: {margin} bunks left."
        else:
            status, sort_weight = "safe", 5
            margin = math.floor((attended - (target * conducted)) / target)
            msg = f"Safe: {margin} bunks left."
        return {"name": subject_name, "type": class_type, "attended": attended, "conducted": conducted, "percentage": pct_display, "status": status, "margin": margin, "message": msg, "sort_weight": sort_weight}
    except Exception as e:
        return {"name": subject_name, "status": "error", "sort_weight": 99}

def analyze_all_subjects(subjects_data, target=0.75):
    try:
        analyzed = [calculate_subject_stats(s['name'], s['attended'], s['conducted'], s.get('type', 'Theory'), target) for s in subjects_data]
        analyzed.sort(key=lambda x: (x.get('sort_weight', 99), x.get('percentage', 100)))
        defaulters = [s for s in analyzed if s.get('status') == 'critical']
        total_att = sum(s.get('attended', 0) for s in subjects_data)
        total_con = sum(s.get('conducted', 0) for s in subjects_data)
        return {
            "overall_status": "safe" if not defaulters else "defaulter",
            "aggregate_percentage": round((total_att / total_con * 100), 2) if total_con > 0 else 0,
            "defaulter_count": len(defaulters),
            "subject_breakdown": analyzed
        }
    except Exception as e:
        return {"overall_status": "error", "subject_breakdown": []}