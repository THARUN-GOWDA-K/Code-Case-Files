"""
Seed additional challenge cases for the Code Case Files application.
Run this script to add more cases to the database.
"""

import os
import sys

try:
    from .models import session_scope, Case, Stage, TestCase, Hint
except ImportError:
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    from app.models import session_scope, Case, Stage, TestCase, Hint

def seed_additional_cases():
    """Add additional challenge cases to the database."""
    
    additional_cases = [
        {
            "slug": "case-001-hello-world",
            "title": "Hello World",
            "summary": "Your first case. Write a program that prints a simple greeting to the console.",
            "difficulty": "easy",
            "stages": [
                {
                    "title": "Print Greeting",
                    "order": 1,
                    "time_limit_seconds": 60,
                    "memory_limit_mb": 128,
                    "allowed_languages": ["python"],
                    "prompt": "A witness left one final message in the case system. Read no input and print exactly: Hello, detective!",
                    "description": "Write a minimal Python program that prints the case-file greeting exactly once.",
                    "starter_code": "print(\"Hello, detective!\")\n",
                    "tests": [("", "Hello, detective!", False), ("", "Hello, detective!", True)],
                    "hints": [
                        ("The output is a greeting, so this stage needs one deliberate console write.", 0),
                        ("Use Python's built-in print function with the requested greeting text.", 2),
                        ("Print exactly the expected greeting and avoid extra labels or punctuation.", 5),
                    ],
                }
            ]
        },
        {
            "slug": "case-002-data-breach",
            "title": "Data Breach",
            "summary": "Investigate a suspected data breach at a tech company by analyzing access logs and user activity patterns.",
            "difficulty": "medium",
            "stages": [
                {
                    "title": "Analyze Access Patterns",
                    "order": 1,
                    "time_limit_seconds": 120,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "The access log contains JSON records with user and action fields. Print the user with the most failed actions; break ties alphabetically.",
                    "description": "Read a JSON list from stdin, count records whose action is 'failed' by user, and print one username.",
                    "starter_code": "import json\nfrom collections import Counter\nimport sys\n\nrecords = json.load(sys.stdin)\nfailed = Counter(record['user'] for record in records if record['action'] == 'failed')\nprint(min(failed, key=lambda user: (-failed[user], user)))\n",
                    "tests": [
                        ('[{"user":"maya","action":"ok"},{"user":"mallory","action":"failed"},{"user":"mallory","action":"failed"},{"user":"maya","action":"failed"}]', "mallory", False),
                        ('[{"user":"zoe","action":"failed"},{"user":"amy","action":"failed"}]', "amy", True),
                    ],
                    "hints": [
                        ("Access logs become useful when you compare who appears and how often.", 0),
                        ("Group or count log activity by the relevant user or identifier before judging the pattern.", 2),
                        ("Return the access pattern the tests request, keeping the suspicious subject distinct from normal traffic.", 5),
                    ],
                },
                {
                    "title": "Identify Suspicious Activity",
                    "order": 2,
                    "time_limit_seconds": 180,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "The breach report lists JSON events with user and ip fields. Print sorted usernames that accessed from at least two distinct IP addresses.",
                    "description": "Detect accounts whose access records span multiple IP addresses and print their names comma-separated in alphabetical order.",
                    "starter_code": "import json\nimport sys\n\nevents = json.load(sys.stdin)\nips_by_user = {}\nfor event in events:\n    ips_by_user.setdefault(event['user'], set()).add(event['ip'])\nprint(','.join(sorted(user for user, ips in ips_by_user.items() if len(ips) >= 2)))\n",
                    "tests": [
                        ('[{"user":"ava","ip":"10.0.0.1"},{"user":"ava","ip":"10.0.0.2"},{"user":"ben","ip":"10.0.0.3"}]', "ava", False),
                        ('[{"user":"zoe","ip":"a"},{"user":"zoe","ip":"b"},{"user":"amy","ip":"x"},{"user":"amy","ip":"y"}]', "amy,zoe", True),
                    ],
                    "hints": [
                        ("Look for activity that breaks the ordinary access pattern rather than inspecting one row in isolation.", 0),
                        ("Compare each user's events against the surrounding log entries and track the fields that identify unusual behavior.", 2),
                        ("Filter the anomalous records using the required condition, then return the exact result shape expected by the grader.", 5),
                    ],
                }
            ]
        },
        {
            "slug": "case-003-cryptic-messages",
            "title": "Cryptic Messages",
            "summary": "Decode encrypted messages sent between suspected criminals using frequency analysis and pattern recognition.",
            "difficulty": "hard",
            "stages": [
                {
                    "title": "Frequency Analysis",
                    "order": 1,
                    "time_limit_seconds": 180,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "Forensic analysts recovered a message as plain text. Print a JSON object containing the case-insensitive frequency of each letter, ignoring spaces and punctuation.",
                    "description": "Normalize letters to lowercase, count only alphabetic characters, and serialize the frequency mapping with alphabetic keys.",
                    "starter_code": "import json\nimport sys\nfrom collections import Counter\n\ntext = json.load(sys.stdin)\ncounts = Counter(character.lower() for character in text if character.isalpha())\nprint(json.dumps(dict(sorted(counts.items())), separators=(',', ':')))\n",
                    "tests": [
                        ('"Dead drop!"', '{"a":1,"d":3,"e":1,"o":1,"p":1,"r":1}', False),
                        ('"A-A b!"', '{"a":2,"b":1}', True),
                    ],
                    "hints": [
                        ("Letter counts are the first fingerprint to extract from the captured message.", 0),
                        ("Normalize the text as the task requires, then count alphabetic characters with a mapping.", 2),
                        ("Produce the requested frequency result in the expected order and exclude irrelevant characters.", 5),
                    ],
                },
                {
                    "title": "Pattern Recognition",
                    "order": 2,
                    "time_limit_seconds": 240,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "The intercepted message uses repeated words as a fingerprint. Print the first word that appears twice, preserving its original spelling; print NONE if every word is unique.",
                    "description": "Read a JSON string, split on whitespace, and find the earliest repeated word by scanning from left to right.",
                    "starter_code": "import json\nimport sys\n\nwords = json.load(sys.stdin).split()\nseen = set()\nfor word in words:\n    if word in seen:\n        print(word)\n        break\n    seen.add(word)\nelse:\n    print('NONE')\n",
                    "tests": [
                        ('"red blue red green"', "red", False),
                        ('"one two three"', "NONE", True),
                    ],
                    "hints": [
                        ("Repeated symbols and separators can reveal the structure of the encoded message.", 0),
                        ("Build a representation of the repeated pattern before attempting to decode its meaning.", 2),
                        ("Return the identified pattern in the exact form requested rather than the entire message.", 5),
                    ],
                },
                {
                    "title": "Message Decryption",
                    "order": 3,
                    "time_limit_seconds": 300,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "The recovered note is Caesar-shifted. Read a JSON object with message and shift fields, shift letters backward, preserve case, and print the decoded message.",
                    "description": "Decode alphabetic characters with wraparound while leaving digits, spaces, and punctuation unchanged.",
                    "starter_code": "import json\nimport sys\n\ndata = json.load(sys.stdin)\nmessage = data['message']\nshift = data['shift'] % 26\nresult = []\nfor character in message:\n    if 'a' <= character <= 'z':\n        result.append(chr((ord(character) - ord('a') - shift) % 26 + ord('a')))\n    elif 'A' <= character <= 'Z':\n        result.append(chr((ord(character) - ord('A') - shift) % 26 + ord('A')))\n    else:\n        result.append(character)\nprint(''.join(result))\n",
                    "tests": [
                        ('{"message":"Khoor, Zruog!","shift":3}', "Hello, World!", False),
                        ('{"message":"abc XYZ","shift":2}', "yza VWX", True),
                    ],
                    "hints": [
                        ("Treat the encoded message as text that must be transformed one character at a time.", 0),
                        ("A Caesar shift wraps around the alphabet, so preserve case while rotating letters.", 2),
                        ("Shift each alphabetic character backward by the supplied amount and leave nonletters unchanged.", 5),
                    ],
                }
            ]
        },
        {
            "slug": "case-004-network-intrusion",
            "title": "Network Intrusion",
            "summary": "Trace the source of a network intrusion by analyzing packet logs and connection patterns.",
            "difficulty": "medium",
            "stages": [
                {
                    "title": "Packet Analysis",
                    "order": 1,
                    "time_limit_seconds": 150,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "The packet capture contains JSON records with source, destination, and bytes. Print the source address that sent the most total bytes; break ties lexicographically.",
                    "description": "Aggregate packet sizes by source address and report the busiest sender.",
                    "starter_code": "import json\nimport sys\nfrom collections import defaultdict\n\npackets = json.load(sys.stdin)\ntotals = defaultdict(int)\nfor packet in packets:\n    totals[packet['source']] += packet['bytes']\nprint(min(totals, key=lambda source: (-totals[source], source)))\n",
                    "tests": [
                        ('[{"source":"10.0.0.1","destination":"x","bytes":20},{"source":"10.0.0.2","destination":"x","bytes":50},{"source":"10.0.0.1","destination":"y","bytes":40}]', "10.0.0.1", False),
                        ('[{"source":"b","destination":"x","bytes":10},{"source":"a","destination":"x","bytes":10}]', "a", True),
                    ],
                    "hints": [
                        ("A packet log is a sequence of records; first identify which fields describe each packet.", 0),
                        ("Inspect the packet attributes that distinguish the intrusion from routine traffic.", 2),
                        ("Select the matching packets and return them in the order and shape required by the case.", 5),
                    ],
                },
                {
                    "title": "Connection Tracing",
                    "order": 2,
                    "time_limit_seconds": 200,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "Trace the intrusion through JSON connection records containing from and to fields plus a start field. Print the path from start until it reaches a node with no outgoing connection, joined by ->.",
                    "description": "Follow a directed connection chain and emit each visited node exactly once.",
                    "starter_code": "import json\nimport sys\n\ndata = json.load(sys.stdin)\nnext_node = {edge['from']: edge['to'] for edge in data['connections']}\npath = [data['start']]\nwhile path[-1] in next_node and next_node[path[-1]] not in path:\n    path.append(next_node[path[-1]])\nprint('->'.join(path))\n",
                    "tests": [
                        ('{"start":"a","connections":[{"from":"a","to":"b"},{"from":"b","to":"c"}]}', "a->b->c", False),
                        ('{"start":"gateway","connections":[{"from":"gateway","to":"host"}]}', "gateway->host", True),
                    ],
                    "hints": [
                        ("Connections form a chain: an origin and destination can be followed across records.", 0),
                        ("Use the shared address or connection identifier to link related packets together.", 2),
                        ("Trace the matching chain without inventing hops, and return the endpoint data the tests expect.", 5),
                    ],
                }
            ]
        },
        {
            "slug": "case-005-missing-artifact",
            "title": "Missing Artifact",
            "summary": "A valuable artifact has gone missing from a museum. Investigate security footage and access logs to find the thief.",
            "difficulty": "easy",
            "stages": [
                {
                    "title": "Security Footage Analysis",
                    "order": 1,
                    "time_limit_seconds": 90,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "Security footage is a JSON list of observations. Print the person whose record shows them entering the gallery during the theft window, marked by action=enter and zone=gallery.",
                    "description": "Filter footage by both the incident zone and entry action, then report the matching person.",
                    "starter_code": "import json\nimport sys\n\nfootage = json.load(sys.stdin)\nfor record in footage:\n    if record['action'] == 'enter' and record['zone'] == 'gallery':\n        print(record['person'])\n        break\n",
                    "tests": [
                        ('[{"person":"Mina","zone":"lobby","action":"enter"},{"person":"Victor","zone":"gallery","action":"enter"}]', "Victor", False),
                        ('[{"person":"Ada","zone":"gallery","action":"exit"},{"person":"Bea","zone":"gallery","action":"enter"}]', "Bea", True),
                    ],
                    "hints": [
                        ("Start by treating each footage record as evidence with a time and subject.", 0),
                        ("Compare the relevant timestamps or identifiers to isolate the person present during the incident.", 2),
                        ("Filter the footage using the incident's condition and return the requested suspect evidence only.", 5),
                    ],
                },
                {
                    "title": "Access Log Correlation",
                    "order": 2,
                    "time_limit_seconds": 120,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"],
                    "prompt": "Cross-reference JSON footage records and access records. Print sorted names that appear in both sources, comma-separated.",
                    "description": "Build a set from the footage subjects, intersect it with access-log users, and produce deterministic output.",
                    "starter_code": "import json\nimport sys\n\ndata = json.load(sys.stdin)\nfootage_people = {record['person'] for record in data['footage']}\naccess_people = {record['user'] for record in data['access']}\nprint(','.join(sorted(footage_people & access_people)))\n",
                    "tests": [
                        ('{"footage":[{"person":"Ada"},{"person":"Bea"}],"access":[{"user":"Bea"},{"user":"Cy"}]}', "Bea", False),
                        ('{"footage":[{"person":"Zoe"},{"person":"Amy"}],"access":[{"user":"Zoe"},{"user":"Amy"}]}', "Amy,Zoe", True),
                    ],
                    "hints": [
                        ("The access records and the footage describe the same people from different angles.", 0),
                        ("Create a lookup from one evidence source, then compare each access record against it.", 2),
                        ("Keep only the correlated suspect activity and preserve the output order required by the grader.", 5),
                    ],
                }
            ]
        }
    ]
    
    with session_scope() as sess:
        for case_data in additional_cases:
            existing_case = sess.query(Case).filter_by(slug=case_data["slug"]).first()
            if existing_case:
                continue
            
            case = Case(
                slug=case_data["slug"],
                title=case_data["title"],
                summary=case_data["summary"],
                difficulty=case_data["difficulty"],
                content={}
            )
            sess.add(case)
            sess.flush()
            
            # Create stages
            for stage_data in case_data["stages"]:
                stage = Stage(
                    case_id=case.id,
                    title=stage_data["title"],
                    order=stage_data["order"],
                    time_limit_seconds=stage_data["time_limit_seconds"],
                    memory_limit_mb=stage_data["memory_limit_mb"],
                    allowed_languages=stage_data["allowed_languages"],
                    prompt=stage_data.get("prompt"),
                    description=stage_data.get("description"),
                    starter_code=stage_data.get("starter_code"),
                )
                sess.add(stage)
                sess.flush()
                for order, (text, cost) in enumerate(stage_data.get("hints", []), start=1):
                    sess.add(Hint(stage_id=stage.id, text=text, cost_points=cost, order=order))
                for test_input, expected_output, is_hidden in stage_data.get("tests", []):
                    sess.add(TestCase(
                        stage_id=stage.id,
                        input=test_input,
                        expected_output=expected_output,
                        is_hidden=is_hidden,
                    ))
            
            print(f"Added case: {case_data['title']}")
    
    print("Additional cases seeded successfully!")

if __name__ == "__main__":
    seed_additional_cases()
