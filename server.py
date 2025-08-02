from flask import Flask, request, jsonify
import pycuber as pc
import kociemba
import random
from collections import Counter
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

KOCIEMBA_FACE_ORDER = ["U", "R", "F", "D", "L", "B"]

def normalize_colour(col):
    if isinstance(col, str):
        return col.strip().lower()
    return str(col).strip().lower()

def infer_face_centers(cube: pc.Cube) -> dict:
    face_center_colour = {}
    for face in KOCIEMBA_FACE_ORDER:
        f = cube.get_face(face)
        center_raw = f[1][1].colour
        center = normalize_colour(center_raw)
        if not center or center in {"", "none", "unknown"}:
            all_cols = [normalize_colour(f[r][c].colour) for r in range(3) for c in range(3)]
            most_common, _ = Counter(all_cols).most_common(1)[0]
            face_center_colour[face] = most_common
        else:
            face_center_colour[face] = center
    return face_center_colour

def cube_to_kociemba_string(cube: pc.Cube) -> str:
    face_centers = infer_face_centers(cube)
    colour_to_face = {}
    for face, colour in face_centers.items():
        if colour in colour_to_face and colour_to_face[colour] != face:
            raise ValueError(f"Ambiguous colour '{colour}' for faces {colour_to_face[colour]} and {face}")
        colour_to_face[colour] = face

    facelet = ""
    for face in KOCIEMBA_FACE_ORDER:
        f = cube.get_face(face)
        for r in range(3):
            for c in range(3):
                sticker_colour = normalize_colour(f[r][c].colour)
                if sticker_colour in colour_to_face:
                    facelet += colour_to_face[sticker_colour]
                else:
                    matched = False
                    for known in colour_to_face:
                        if sticker_colour.startswith(known) or known.startswith(sticker_colour):
                            facelet += colour_to_face[known]
                            matched = True
                            break
                    if not matched:
                        raise ValueError(f"Unrecognized sticker colour '{sticker_colour}' on face {face}")
    return facelet

def cube_to_color_map(cube: pc.Cube):
    # Returns dictionary face -> list of 9 normalized colors
    mapping = {}
    for face in KOCIEMBA_FACE_ORDER:
        f = cube.get_face(face)
        stickers = []
        for r in range(3):
            for c in range(3):
                stickers.append(normalize_colour(f[r][c].colour))
        mapping[face] = stickers
    return mapping

def random_scramble(moves=25):
    faces = ["U", "D", "L", "R", "F", "B"]
    modifiers = ["", "'", "2"]
    scramble = []
    prev_face = ""
    for _ in range(moves):
        face = random.choice(faces)
        while face == prev_face:
            face = random.choice(faces)
        mod = random.choice(modifiers)
        scramble.append(f"{face}{mod}")
        prev_face = face
    return " ".join(scramble)

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json or {}
    scramble = data.get("scramble") or random_scramble()
    cube = pc.Cube()
    try:
        cube(scramble)
    except Exception as e:
        return jsonify({"error": f"Invalid scramble: {e}"}), 400

    pre_state = cube_to_color_map(cube)
    try:
        facelet_str = cube_to_kociemba_string(cube)
        solution = kociemba.solve(facelet_str)
    except Exception as e:
        return jsonify({"error": f"Solver error: {e}"}), 500

    # Apply solution
    cube_after = cube.copy()
    if solution.strip():
        cube_after(solution)
    post_state = cube_to_color_map(cube_after)
    solved = all(
        all(col == post_state[face][4] for col in post_state[face]) for face in KOCIEMBA_FACE_ORDER
    )

    return jsonify({
        "scramble": scramble,
        "solution": solution,
        "pre_state": pre_state,
        "post_state": post_state,
        "solved": solved
    })

if __name__ == "__main__":
    app.run(debug=True)
