# Pykage

Pykage creates a perfect python package project with high configurability.

## Install
Clone and `$ npm install && npm run start`


The generated project features:
- filled `setup.py`
- `.travis.yml` that enables automatic testing on different python versions
- `.travis.yml` that enables automatic pypi release upon tagged github commit
- detailed instructions, function stubs and comments

The tool also remembers your profile and saves you time from keying in the same thing over and over again. 

![showcase.gif](readme_assets/showcase.gif)


## Highly Configurable


![configurability](readme_assets/configurability.png)

The basic project structure it creates:

```
packagename/
├── LICENSE
├── readme_assets
├── README.md
├── requirements.txt
├── setup.py
├── tests
│   ├── data
│   ├── __init__.py
│   └── main_test.py
└── packagename
    ├── __init__.py
    └── main.py

```

Check this [pyckage-example-project](https://github.com/Madoshakalaka/pyckage-example-project) repo to see what an example it generates.
