# WHEN2MEET2 - CS1320 Final Project

# Directory
- public(frontend) - compiled `js` and `css` files by Gulp
- src(frontend) - source `js` and `sass` files that need to be compiled
- views(frontend) - view model files. (using `pug` for now)
- routes(backend) - backend routers

# Run
1. `npm i` & `npm i gulp -g` or `npm i gulp` if don't have access to `sudo`
2. `gulp`
3. `node server.js`
3. Visit `localhost:8080/`

# Demo
The demo of our core functionality runs in `http://localhost:8080/attend/4d0668f2-978b-4987-8cb2-1494cf7ebd39`, which represents
a meeting needs to be scheduled.

You can select your time slots with different priorities and submit them. These information goes into
backend and database. And the calculated freedom priority calendar(on the right) will be updated, too. 
The gray scale of the time slot indicates the overall freedom choose by people.
 
The event creating API is available via `/event/create`, but the page is still under construction.
