const e = require("express");
const express = require("express");
const app = express();
const PORT = 3000;


/*  Extract properties by name from sources, and enforce specified conditions
    sources is an object or an array of objects
    typedVars is an array with entries that look like
        {name: string, opts: string]
        opts can contain zero or more of the following characters, enforcing the respective conditions
        'm': manditory - if not given, variable is optional and will only be extracted if it's in one of the sources
        's': string - coerce to type string - may be needed someday?
        'n': number - coerce to type number
        'f': finite - throw an error if Number.isFinite() returns false, does not do type coercion without n
*/
function extractTypedVars(typedVars, sources) {
    const result = {};
    if (!Array.isArray(sources)) sources = [sources];
    varNameLoop:
    for (const varSpec of typedVars) {
        for (const source of sources) {
            if (varSpec.name in source) {
                result[varSpec.name] = source[varSpec.name];
                if (varSpec.opts.includes('s')) result[varSpec.name] = String(source[varSpec.name]);
                if (varSpec.opts.includes('n')) result[varSpec.name] = Number(source[varSpec.name]);
                if (varSpec.opts.includes('f') && !isFinite(result[varSpec.name])) throw `${varSpec.name} must be a finite number.`;
                continue varNameLoop;
            };
        };
        if (varSpec.opts.includes('m')) throw `${varSpec.name} required but not found.`;
    };
    return result;
};

// Set up the server to be restarted easily
app.get("/", (req, res, next) => {
    res.status(200).send("Hello World! <a href=\"/stop\">Click here to stop server!</a>");
});

app.get("/stop", (req, res, next) => {
    res.status(200).send("Stopping Server!");
    console.log("Stopping server!");
    server.close();
})

/* envelopes schema:
{
    id: integer,
    name: "String",
    balance: number
}
 */
var envelopes = [];
var maxEnvelopeId = 0;

function addEnvelope(envelopeData) {
    const newEnvelope = envelopeData;
    newEnvelope.id = maxEnvelopeId++;
    envelopes.push(newEnvelope);
    return newEnvelope;
}

const extractEnvelope = (req, res, next) => {
    try {
        const newEnvelope = extractTypedVars([{ name: 'name', opts: 'm' }, { name: 'balance', opts: 'mnf' }], req.query);
        if (newEnvelope.balance < 0) throw "You have to be rich to afford to use negative amounts of money.";
        req.envelope = newEnvelope;
        next();
    } catch (err) {
        console.log(err.message);
        res.status(400).send(err.message);
    };
};

app.get('/envelopes', (req, res, next) => {
    res.status(200).send(envelopes);
});

app.post("/envelopes", extractEnvelope, (req, res, next) => {
    const newEnvelope = addEnvelope(req.envelope);
    res.status(201).send(newEnvelope);
});

app.param('envelopeId', (req, res, next, id) => {
    const envelope = envelopes.find(e => e.id == id);
    if (envelope) {
        req.envelopeId = id;
        next();
    } else {
        res.status(404).send('Envelope not found');
    };
});

app.get('/envelopes/:envelopeId', (req, res, next) => {
    res.status(200).send(envelopes.find(e => e.id == req.envelopeId));
});

app.delete('/envelopes/:envelopeId', (req, res, next) => {
    const envelopeIndex = envelopes.findIndex(e => e.id == req.envelopeId);
    if (envelopeIndex != -1) {
        envelopes.splice(envelopeIndex, 1);
    };
    res.status(204).send();
})

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT} at time ${new Date().toString()}`);
});