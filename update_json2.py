import json
import sys

names = [
    "Mahima Jassi P1", "Sanjay Madari P10", "Suresh Gundupalli P16", "Rachamalla Sai Ram Reddy P29", 
    "G Lakshmi Priyanka P4", "Chidananda Sahu P14", "Sriramula Prathyusha P22", "Ayushmaan Roy P27", 
    "Nithin B P11", "Amogh Nath P26", "Madari Ravalika P21", "Santosh Sankanal P6", 
    "Nihal B P12", "Madineni Priyanka P25", "B Mouli P20", "Harsh Khatri P18", 
    "Premchand Kodali P15", "Medagone Ranadeep P19", "Aditya Singh P24", "Sreedhar Patti P13", 
    "M Gaurav Dhir P17", "Harshini Bollineni P23"
]

file_path = "data.json"

try:
    with open(file_path, "r") as f:
        data = json.load(f)
        
    for i, row in enumerate(data):
        row["Resource names"] = names[i % len(names)]
        
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
        
    print("Successfully mapped Resource names to data.json.")
except Exception as e:
    print(f"Failed: {e}")
    sys.exit(1)
