# Pykage

![showcase.gif](readme_assets/showcase.gif)

Pykage creates a perfect python package projet for you with the following directory structure with every file filled in automatically according to the options.

```
packagename/
├── LICENSE
├── readme_assets
├── README.md
├── setup.py
├── tests
│   ├── fixtures
│   ├── __init__.py
│   └── main_test.py
└── packagename
    ├── __init__.py
    └── main.py

```

The generated project features:
- `.travis.yml` that enables automatic testing on different python versions
- `.travis.yml` that enables automatic pypi release upon tagged github commit
- detailed instructions, function stubs and comments

## Install
https://github.com/Madoshakalaka/pykage/releases