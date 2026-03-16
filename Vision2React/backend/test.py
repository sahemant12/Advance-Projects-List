import imports
from exports.redis.queue import enqueue

node = {
    "node_type": "fetch_figma",
    "payload": {
        "file_key": "RPrT21DMtANvlRchlFWAsp",
        "saved_path": "data/figma/design.json",
    },
}
enqueue(node)
print("Task queued.")
