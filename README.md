## Production Changes:

1. `npm uninstall dotenv` & remove `package-lock.json`
2. `package.json` -> remove `scripts` & `dotenv`
3. `db.js` -> remove `import dotenv`
4. `index.js` -> listens on environment port instead of hardcoded port:

```
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
