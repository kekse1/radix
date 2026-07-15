<img src="without.svg" /><br>
<img src="https://kekse.biz/github.php?draw&override=github:radix" />

# **`radix`** (and `unit`s)
This is 'under development', maybe.. it needs adaption to run without
my own library extension(s). But you can use it if you want to create
your own polyfills - it should work really well, right now!

<br>

I'm using it in the Web Browser and w/ [Node.js](https://nodejs.org/).

Since I've implemented many versions of the same functionality (more/less),
I had to decide which ones to publish here. I hope it's the best version
for you!

<br>

> [!NOTE]
> It's **not** another [`decimal.js`](https://mikemcl.github.io/decimal.js/)!
> If you need real numeric precision, use this one or smth. similar.
> This `radix` module just extends the base numeric features of JavaScript.

<br><br>

## News
* \[**2026-07-15**\] New `Math.time.clock*` function/namespace. See [`unit.js`](src/unit.js); ...
* \[**2026-07-02**\] Really much better version of the latest [`unit.js`](src/unit.js)!
* \[**2026-06-29**\] Just published the second file [`unit.js`](src/unit.js) (again, but a bit better this time);

<br><br>

## Features
These are my main features:

- [x] Numeric conversions between various radix/base.
- [x] Including some **alphabet** parts.
- [x] Even supports full **byte** code/radix/base (256).
- [x] Extra \*near\* byte code w/ 1 to 3 less bytes for [ `.`, `-`, `+` ] bytes..
- [x] Negative radix/base are also supported (inversed/reversed alphabets, ...);
- [x] Unlike Vanilla JavaScript, I'm also supporting `parseFloat()` w/ dynamic radix/base.
- [x] Kinda `isNaN` for Strings - but for any radix/base.
- [x] Parsing, rendering and calculations both **time** and **size** values.
- [x] Some more numeric extensions (better sign handling, ...);
- [x] Both `Number` and `BigInt` fully supported.
- [x] `Math.time.clock*` (look at the sources, fyi);
- [ ] TODO @ **clock**: a syntax like **`@30s`**!!1 :-D
- [ ] TODO: I've to find my old code for exponents.
- [ ] TODO: Maybe also find my old code for localized strings..
- [ ] TODO: And the code to handle `BigInt` **time** (see `process.hrtime.bigint()`);

<br>

> [!WARNING]
> Script(s) will also extend the global `Number` and `BigInt` Objects,
> so please `import` it/them only once!

<br><br>

## Download
Etwas unleserlich (not so clean code)... still **TODO**.
Die zweite Datei ist aber schon etwas besser! ...
und die dritte ist ganz neu (**2026-07-15**).

- [x] [**`radix.js`**](src/radix.js)
- [x] [**`unit.js`**](src/unit.js)

<br>

> [!TIP]
> The newest *clock* part in the [`unit.js`](src/unit.js) was created in the backup file
> [`clock.TEST.js`](src/clock.TEST.js) - there you can also find **TEST CASES** - so you
> get a feeling of the correct syntax, etc. See also the [**screenshot**](./img/clock.TEST.png)!

> [!NOTE]
> **TODO** is now only a syntax like **`@30s`**! :-D

<br><br>

> [!TIP]
> For other example size/time implementations see this URL:
> < https://kekse.biz/?js/lib/globals/math.unit.js >

<br><br><br>

# Contact
<img src="https://kekse.biz/github.php?override=github:radix&draw&text=radix@kekse.biz&angle=6&size=38pt&fg=150,20,90&font=OpenSans&ro&readonly&h=64&v=16" />

<br>

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

<a href="https://kekse.biz/">
<img src="favicon.png" alt="Favicon" />
</a>

