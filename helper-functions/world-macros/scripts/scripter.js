export class scripter{
    static async execute() {
        try {
            let pack = await game.packs.get("dnd-5e-core-compendium.world-macros");
            let contents = await pack.getDocuments();
            contents.forEach(macro => scripter.execute_macro(macro));
        } catch (err) {
            console.error(err);
        }
    }

    static execute_macro (macro) {
        try {
            eval(macro.command);
        } catch (err) {
            console.error(err);
        }
    }
}