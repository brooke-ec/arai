# BUILDER STAGE

FROM python:3.11 AS BUILDER

RUN pip install poetry

COPY poetry.lock pyproject.toml ./

RUN poetry export > ./requirements.txt

# PRODUCTION STAGE

FROM python:3.11-alpine AS PRODUCTION

COPY --from=BUILDER ./requirements.txt ./requirements.txt

RUN pip install -r requirements.txt

RUN rm ./requirements.txt

WORKDIR /src/

COPY /src/ ./

CMD ["python3", "app.py"]