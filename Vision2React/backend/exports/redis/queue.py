import json
from typing import Dict

from .redis import redis_client

TASK_QUEUE = "tasks"
SECTIONS_QUEUE = "sections"


def enqueue(node_data: Dict, queue_name: str = TASK_QUEUE):
    try:
        job = redis_client.lpush(queue_name, json.dumps(node_data))
        if job:
            print(f"Job has been added to queue: {queue_name}")
    except Exception as e:
        print(f"Error while adding to queue: {str(e)}")


def dequeue(timeout: int = 0, queue_name: str = TASK_QUEUE):
    try:
        job = redis_client.brpop(queue_name, timeout)
        if job:
            print(f"Job has been popped from the queue: {queue_name}")
            return json.loads(job[1])
        return None
    except Exception as e:
        print(f"Erorr while removing from queue: {str(e)}")
