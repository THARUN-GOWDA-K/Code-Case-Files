"""
Seed additional challenge cases for the Code Case Files application.
Run this script to add more cases to the database.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from .models import session_scope, Case, Stage

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
                    "allowed_languages": ["python"]
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
                    "allowed_languages": ["python"]
                },
                {
                    "title": "Identify Suspicious Activity",
                    "order": 2,
                    "time_limit_seconds": 180,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"]
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
                    "allowed_languages": ["python"]
                },
                {
                    "title": "Pattern Recognition",
                    "order": 2,
                    "time_limit_seconds": 240,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"]
                },
                {
                    "title": "Message Decryption",
                    "order": 3,
                    "time_limit_seconds": 300,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"]
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
                    "allowed_languages": ["python"]
                },
                {
                    "title": "Connection Tracing",
                    "order": 2,
                    "time_limit_seconds": 200,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"]
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
                    "allowed_languages": ["python"]
                },
                {
                    "title": "Access Log Correlation",
                    "order": 2,
                    "time_limit_seconds": 120,
                    "memory_limit_mb": 256,
                    "allowed_languages": ["python"]
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
                    prompt=stage_data.get("prompt")
                )
                sess.add(stage)
            
            print(f"Added case: {case_data['title']}")
    
    print("Additional cases seeded successfully!")

if __name__ == "__main__":
    seed_additional_cases()
