from backend.app.services.cases import seed_sample_case


if __name__ == "__main__":
    c = seed_sample_case()
    print("Seeded case:", c.slug)
