from setuptools import setup, find_packages

setup(
    name="tylerdeck",
    version="1.0.0",
    description="Python SDK for TylerDeck — Production Control Plane for AI Agents",
    author="TylerDeck Engineering",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
