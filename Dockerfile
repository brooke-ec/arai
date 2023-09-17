FROM python:3.10-alpine
COPY src/ /opt/arai
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install -r /tmp/requirements.txt
RUN rm /tmp/requirements.txt
WORKDIR /opt/arai
CMD ["python3", "app.py"]