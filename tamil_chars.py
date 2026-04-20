def generate_uyirmei_matrix():
    """
    Generates the complete 12 x 18 Uyirmei (Vowel-Consonant) matrix.
    Returns a list of lists: shape (12, 18)
    """
    pure_consonants = [
        "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்",
        "த்", "ந்", "ப்", "ம்", "ய்", "ர்",
        "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்"
    ]
    
    # Vowel signs (diacritics)
    vowel_signs = ["", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"]
    
    uyirmei = []
    
    for cons in pure_consonants:
        row = []
        for sign in vowel_signs:
            if sign == "":  # Special case for 'அ' - remove pulli
                char = cons[:-1]           # "க்" → "க"
            else:
                char = cons[:-1] + sign    # "க்" + "ா" → "கா"
            row.append(char)
        uyirmei.append(row)
    
    return uyirmei


# Usage
matrix = generate_uyirmei_matrix()
print(f"Shape: {len(matrix)} x {len(matrix[0])}")   # → 12 x 18
print(f"Total Uyirmei: {sum(len(row) for row in matrix)}")  # → 216
print(f"{matrix}")