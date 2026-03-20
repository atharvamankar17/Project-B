import json, os, time, requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from connections import fetch_vierp_data, parse_attendance, parse_timetable
from calculator import analyze_all_subjects

app = Flask(__name__)
CORS(app)

def get_ip():
    return request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

sync_status = {}

def update_status_for_ip(ip):
    def cb(progress, message):
        if ip not in sync_status: sync_status[ip] = {}
        sync_status[ip] = {"progress": progress, "message": message, "is_running": progress not in [0, 100]}
    return cb

@app.route('/api/status', methods=['GET'])
def get_status():
    ip = get_ip()
    return jsonify(sync_status.get(ip, {"progress": 0, "message": "Idle", "is_running": False}))

@app.route('/api/sync', methods=['POST'])
def sync():
    ip = get_ip()
    cb = update_status_for_ip(ip)
    
    creds = request.get_json()
    if not creds or not creds.get('username'):
        cb(0, "No configured user.")
        return jsonify({"error": "Missing User Configuration Data"}), 401
    
    cb(2, "Waking Engine...")
    try:
        raw = fetch_vierp_data(creds, status_callback=cb)
        if not raw: 
            return jsonify({"error": sync_status.get(ip, {}).get("message", "Fetch Failed")}), 502
            
        cb(95, "Analyzing...")
        att = parse_attendance(raw["attendance_html"])
        tt = parse_timetable(raw["timetable_html"])
        insights = analyze_all_subjects(att)
        
        payload = {
            "aggregate": insights.get("aggregate_percentage", 0),
            "attendance": insights.get("subject_breakdown", []),
            "timetable": tt
        }
        
        cb(100, "Done.")
        return jsonify({"success": True, "cached": False, "data": payload})
    except Exception as e: 
        cb(0, "Error.")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        p = request.get_json()
        config = p.get('config', {})
        sys_prompt = f"You are 'B AI'. Context: {json.dumps(p.get('context'))}. Query: {p.get('prompt')}"

        gemini_key = config.get('geminiKey')
        if not gemini_key: return jsonify({"error": "Missing Key"}), 401
        
        gemini_model = config.get('geminiModel', 'gemini-1.5-flash')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
        r = requests.post(url, json={"contents": [{"parts": [{"text": sys_prompt}]}]})
        
        data = r.json()
        if 'candidates' in data: 
            reply = data['candidates'][0]['content']['parts'][0]['text']
            return jsonify({"reply": reply, "cached": False})
            
        return jsonify({"error": f"Gemini Error: {data.get('error', {}).get('message', 'Unknown Error')}"}), 400
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        from waitress import serve
        serve(app, host='0.0.0.0', port=5000, threads=16)
    except ImportError:
        app.run(host='0.0.0.0', port=5000, threaded=True)