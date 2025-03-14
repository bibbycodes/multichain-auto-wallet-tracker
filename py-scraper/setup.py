from setuptools import setup, find_packages

setup(
    name="py_scraper",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "curl_cffi",
        "python-dotenv",
        "fake-useragent",
    ],
) 