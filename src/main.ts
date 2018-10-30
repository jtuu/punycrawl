import { Game } from "./Game";

function main() {
    try {
        const game = new Game();
        game.run();
    } catch (err) {
        console.error(err);
    }
}

if (Module.calledRun) {
    main();
} else {
    Module.onRuntimeInitialized = main;
}
