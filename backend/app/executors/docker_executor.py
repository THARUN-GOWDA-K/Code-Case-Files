import os
import tempfile
import subprocess
import uuid
import shutil
from typing import Tuple


def run_code_in_docker(source: str, language: str = "python", stdin: str = "", timeout: int = 2, memory: str = "128m", cpus: str = "0.5") -> dict:
    """Run source code inside a short-lived Docker container.

    Requirements: Docker daemon accessible to the process running this code.
    This is a best-effort sandbox - for production consider gVisor/Firecracker.
    """
    # Only Python supported for now
    if language.lower() != "python":
        raise ValueError("Only python supported in docker executor")

    workdir = tempfile.mkdtemp(prefix="codecase-")
    try:
        src_path = os.path.join(workdir, "code.py")
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(source)

        container_name = f"codecase-{uuid.uuid4().hex[:8]}"
        # Build docker run command using official Python image
        cmd = [
            "docker", "run", "--rm",
            "--name", container_name,
            "--network", "none",
            "--memory", memory,
            "--cpus", cpus,
            "--pids-limit", "64",
            "--read-only",
            "-v", f"{src_path}:/tmp/code.py:ro",
            "python:3.11-slim",
            "timeout", str(timeout), "/usr/local/bin/python", "/tmp/code.py"
        ]

        # Provide stdin via subprocess
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            out, err = proc.communicate(input=stdin.encode('utf-8'), timeout=timeout + 1)
        except subprocess.TimeoutExpired:
            proc.kill()
            return {"status": "timeout", "stdout": "", "stderr": "timeout"}

        stdout = out.decode('utf-8', errors='replace')
        stderr = err.decode('utf-8', errors='replace')
        status = "ok" if proc.returncode == 0 else "runtime_error"
        return {"status": status, "stdout": stdout, "stderr": stderr, "returncode": proc.returncode}

    finally:
        try:
            shutil.rmtree(workdir)
        except Exception:
            pass
