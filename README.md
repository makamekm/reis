# Reiso

Reiso - React Isomorphic Framework.
It allows you to make an scalable (horizontaly & verticaly) systems.

Features:
- Workers via __cron__
- Handlers (Jobs' queue) via __Bull__ & __Redis__
- Isomorphic React rendering
- Redux & React Redux
- ORM via __TypeORM__
- Web Server via __ExpressJS__
- GraphQL Server via __Apollo__
- WebSocket GraphQL via __Subscriptions Transport WS__ & __Apollo__
- Upload Server via __Apollo__
- Composer allows you to automaticaly collect all modules without manual importing

### It will allow you to create a fast mvc project with 5 main pillars:

1) Server
2) Client
3) Handler
4) Worker
5) CMD Tool

## The main gist

The structure of your project should be modular (especialy if you are using composer):

- src
  - Entries
  - Composer (You can compose all your modules into specific files)
    - __Modules__
    - My module
      - Bundle Type 1
      - Bundle Type 2
      - ...
    - ...

## Containing NMP modules

1) Type ORM
2) ExpressJS
3) ...

## Hello World:

1) Server
...
2) Client & Server
...
3) Handler
...
4) Worker
...
5) Cmd Tool
...
