import os
import sys
# Add the parent directory (Code-Case-Files) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app.services.cases import seed_sample_case


if __name__ == "__main__":
    c = seed_sample_case()
    print("Seeded case:", c.slug)
