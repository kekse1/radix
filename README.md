<img src="https://kekse.biz/github.php?draw&override=github:radix.js" />

<br><br>

# **`radix.js`**
This is 'under development', maybe.. it needs adaption to run without
my own library extension(s). But you can use it if you want to create
your own polyfills - it should work really well, right now!

I'm using it in the Web Browser and w/ [Node.js](https://nodejs.org/).

Since I've implemented many versions of the same functionality (more/less),
I had to decide which ones to publish here. I hope it's the best version
for you!

<br>

## Description
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
- [ ] TODO: I've to find my old code for exponents.
- [ ] TODO: Maybe also find my old code for localized strings..
- [ ] TODO: And the code to handle `BigInt` **time** (see `process.hrtime.bigint()`);

Caution: Script will extend the global `Number` and `BigInt` Objects,
so please `import` it/them only once!

> [!NOTE]
> It's **not** another [`decimal.js`](https://mikemcl.github.io/decimal.js/)!
> If you need real numeric precision, use this one or smth. similar.
> This `radix.js` just extends the base numeric features of JavaScript.

<br>

## Download
Two main files. Partially still under development..

* [**`base.js`**](src/base.js)
* [**`unit.js`**](src/unit.js)

have phun!

<br>

## Tip
See also my [**Field**](https://github.com/kekse1/field/) implementation,
which is also using kinda base/radix conversion!

<br><br>

# Contact
<img src="https://kekse.biz/github.php?override=github:radix.js&draw&text=radix.js@kekse.biz&angle=6&size=38pt&fg=150,20,90&font=OpenSans&ro&readonly&h=64&v=16" />

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

<a href="https://kekse.biz/">
<img src="favicon.png" alt="Favicon" />
</a>
