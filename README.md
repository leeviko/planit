# Planit

> Organize, prioritize, and achieve more with our project management tool

## Features

- [x] 🔐 Authentication
  - [x] Register
  - [x] Login
  - [ ] Logout
  - [ ] Remember me
- [ ] 🖼️ Boards
  - [ ] Create board
  - [ ] Edit board
  - [x] Favorite board
  - [ ] Delete board
  - [ ] 📃 Lists
    - [ ] Create a list
    - [ ] Edit list
    - [ ] Delete list
    - [ ] Cards
      - [ ] Create card
      - [ ] Edit card
      - [ ] Delete card
  - [ ] 🫳 Drag and drop
    - [ ] Move lists
    - [ ] Move cards
- [ ] Board activity page
- [ ] Manage account page
- [ ] Change theme

## How to run

1. Clone repo

```
git clone https://github.com/leeviko/planit.git
```

2. Install client and server dependencies (make sure you have yarn)

```
// Run in client and server directory
yarn
```

3. In your server directory, make a copy of `.env.template` and rename it to `.env.local` and change the values

4. Run client and server using docker

```
docker compose up
```

5. After that the client should be running in `localhost:3000` and the server in `localhost:5000`
