const fs = require("fs");
const pathlib = require("path");
const _exec = require("child_process").exec;
const json2ts = require("json-to-ts");

function exec(cmd) {
    return new Promise((resolve, reject) => {
        _exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve(stdout);
        });
    });
}

function write(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    });
}

function transformInterface(interface) {
    return "declare " + interface.replace(/^interface/, "type").replace(/{/, "= {") + ";";
}

function makeTypes(data, rootName) {
    let result = "";
    const interfaces = json2ts(data, {rootName});
    for (let i = 0; i < interfaces.length - 1; i++) {
        result += transformInterface(interfaces[i]) + "\n\n";
    }
    result += transformInterface(interfaces[interfaces.length - 1]) + "\n";
    return result;
}

async function makeMeta(filenames) {
    const sheetMeta = {};
    let ox = 0;
    for (const filename of filenames) {
        const size = await exec(`magick identify -ping -format "%wx%h" ${filename}`);
        const [w, h] = size.split("x").map(Number);
        const {name} = pathlib.parse(filename);
        sheetMeta[name] = {
            x: ox,
            y: 0,
            w, h
        };
        ox += w;
    }
    return sheetMeta;
}

async function main(inputFile, outputFile, outputTypeFile) {
    try {
        await exec("which magick");
    } catch (err) {
        console.error("ImageMagick not found");
        return;
    }
    
    const cwd = process.cwd();
    const resDirPath = pathlib.dirname(pathlib.resolve(cwd, inputFile));
    const inputFilenames = require(pathlib.resolve(cwd, inputFile)).map(name => `${resDirPath}/${name}`);

    const writes = [];

    const sheetMeta = makeMeta(inputFilenames);

    if (outputFile) {
        const outDirPath = pathlib.dirname(pathlib.resolve(cwd, outputFile));
        const outFileBasename = pathlib.parse(outputFile).name;
        const sheetWrite = exec(`magick montage -mode concatenate -background none -tile x1 ${inputFilenames.join(" ")} ${outDirPath}/${outFileBasename}.gif`);
        writes.push(sheetWrite);
        const metaWrite = write(`${outDirPath}/${outFileBasename}.json`, JSON.stringify(await sheetMeta));
        writes.push(metaWrite);
    }
    
    if (outputTypeFile) {
        const outTypeFilePath = pathlib.resolve(cwd, outputTypeFile);
        const outTypeFileBasename = pathlib.parse(outputTypeFile).name;
        let typeRootname = outTypeFileBasename.charAt(0).toUpperCase() + outTypeFileBasename.toLowerCase().slice(1);
        if (typeRootname.endsWith(".d")) {
            typeRootname = typeRootname.slice(0, -2);
        }
        const sheetTypes = makeTypes(await sheetMeta, typeRootname);
        const typesWrite = write(outTypeFilePath, sheetTypes);
        writes.push(typesWrite);
    }

    await Promise.all(writes);
}

function printHelp() {
    console.error(
`${pathlib.basename(__filename)}
Usage:

  -i input-file
        Path to a JSON file containing a list of
        files to use for the spritesheet.
  -o output-file
        Path to output file.
        Can be .gif or .json, both will be output regardless.
  -t output-type-file
        Path to output TypeScript typings file.

The -i option is required. At least one of -o or -t must be specified.
`
    );
}

function exitFail() {
    printHelp();
    process.exit(1);
}

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 1 || args.find(arg => arg === "-h" || arg === "--help")) {
        exitFail();
    }
    const opts = {
        inputFile: null,
        outputFile: null,
        outputTypeFile: null
    };
    let curOpt = null;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case "-i":
                curOpt = "inputFile";
                break;
            case "-o":
                curOpt = "outputFile";
                break;
            case "-t":
                curOpt = "outputTypeFile";
                break;
            default:
                console.error("Unknown option: " + arg);
                exitFail();
        }
        const val = args[++i];
        if (!val) {
            break;
        }
        opts[curOpt] = val;
    }
    if (opts.inputFile === null) {
        console.error("No input-file specified.");
        exitFail();
    } else if (opts.outputFile === null && opts.outputTypeFile === null) {
        console.error("No output-file or output-type-file specified.");
        exitFail();
    }
    return [opts.inputFile, opts.outputFile, opts.outputTypeFile];
}

main(...parseArgs());
