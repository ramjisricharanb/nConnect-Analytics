import json

with open('/Users/ramji/Downloads/MRs_List.json', 'r') as f:
    data = json.load(f)

cleaned = []
for row in data:
    env = row.get('Admin-Server-APP', row.get('Admin-Server-App', 'Unknown')).strip()
    
    if env not in ['Admin', 'Server', 'APP', 'Web']:
        print(f"Failed env map: '{env}', keys: {list(row.keys())}")
        env = 'APP'
        
    cleaned.append(env)

counts = {}
for e in cleaned:
    counts[e] = counts.get(e, 0) + 1

print(counts)
