from setuptools import setup, find_packages

setup(
    name="py-scraper",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "requests",
        "python-dotenv",
        "fake-useragent",
        "curl-cffi"
    ]
) 