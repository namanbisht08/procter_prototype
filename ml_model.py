import sys

def detect_face_movement(frame):
    return 1


for line in sys.stdin:
    frame = line.strip() 
    result = detect_face_movement(frame)
    print(result)
    sys.stdout.flush()
