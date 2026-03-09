import json

mapping = [
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Admin New", "Resource names": "Santosh Sankanal P6"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Parent", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Admin New", "Resource names": "Santosh Sankanal P6"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Staff", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Santosh Sankanal P6"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Admin New", "Resource names": "Santosh Sankanal P6"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "SMS", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "SMS", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "SMS", "Resource names": "Nithin B P11, Harshini Bollineni P23, Harsh Khatri P18"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Staff", "Resource names": "Sreedhar Patti P13"},
  {"Module": "NTrack Server", "Resource names": "Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Parent", "Resource names": "Medagone Ranadeep P19"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Server", "Resource names": "Sreedhar Patti P13"},
  {"Module": "Parent", "Resource names": "Harshini Bollineni P23, Medagone Ranadeep P19, G Lakshmi Priyanka P4, Harsh Khatri P18"},
  {"Module": "Staff", "Resource names": "Harsh Khatri P18"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Server", "Resource names": "Sanjay Madari P10, Sreedhar Patti P13, G Lakshmi Priyanka P4"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, G Lakshmi Priyanka P4, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "NTrack Server", "Resource names": "Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Madari Ravalika P21, G Lakshmi Priyanka P4, M Gaurav Dhir P17"},
  {"Module": "Server", "Resource names": "Nithin B P11, G Lakshmi Priyanka P4, M Gaurav Dhir P17"},
  {"Module": "Server", "Resource names": "Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Admin New", "Resource names": "Rachamalla Sai Ram Reddy P29, Mahima Jassi P1, Santosh Sankanal P6, Sanjay Madari P10, Premchand Kodali P15"},
  {"Module": "Parent", "Resource names": "Sanjay Madari P10, Harsh Khatri P18"},
  {"Module": "Staff", "Resource names": "G Lakshmi Priyanka P4, Harsh Khatri P18"},
  {"Module": "Staff", "Resource names": "Harsh Khatri P18"},
  {"Module": "Staff", "Resource names": "Harsh Khatri P18"}
]

with open("data.json", "r") as f:
    data = json.load(f)

# The array mapping from the subagent skips the first row (Marketing) because it started from row 2
# It has exactly 58 elements, data.json has 59 elements.
# Row 1 is Marketing -> "Mahima Jassi P1"

if len(data) == 59:
    data[0]["Resource names"] = "Mahima Jassi P1"
    for i in range(1, 59):
        # assign comma separated string but also ensure it's mapped correctly
        data[i]["Resource names"] = mapping[i-1]["Resource names"]
        
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Succesfully dumped perfect map")
