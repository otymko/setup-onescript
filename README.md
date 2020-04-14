# Setup-Onescript

Setup-Onescript позволяет использовать в действиях Github Action [Onescript](https://oscript.io/). При установке используется другой проект [OVM](https://github.com/oscript-library/ovm) - OneScript Version Manager.

## Использование

Описание действия [action.yml](action.yml)

### Базовый пример

```yaml
- uses: actions/checkout@v2
- uses: otymko/setup-onescript@v1
  with:
    version: 1.3.0 # Требуемая версия OneScript
- run: oscript /path/to/script/test.os
```

Параметр `version` поддерживает следующие значения:
* 1.0.21
* 1.2.0
* 1.3.0
* dev (текущая ночная сборка)

### Использование matrix

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        oscript_version: [1.2.0, 1.3.0, dev]
    name: Тестирование проекта
    steps:
      - uses: actions/checkout@v2
      - name: Установка Onescript
        uses: otymko/setup-onescript@v1
        with:
          java-version: ${{ matrix.oscript_version }}
      - run: oscript /path/to/script/test.os

```

### Пример использования

Этот Action используется в проекте [GitRules](https://github.com/otymko/gitrules). В этом проекте реализован workflow для тестирования. 
Более подробно посмотреть можно в [workflows](https://github.com/otymko/gitrules/tree/develop/.github/workflows).

# Лицензия

Данный проект размещен под лицензией [MIT License](LICENSE)

# Контрибьютерам

Доработка проводится по git-flow.



