try {
    if (args[0].macroPass == "preItemRoll" && !args[0].item.system.uses?.value) {
		const usesItem = args[0].actor.items.find(i => i.name == "Font of Magic" && i.system.uses?.value > 4);
		if (!usesItem) return;
		let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Trance of Order",
            content: `<p>Spend 5 Sorcery points to use Trance of Order again?</p>`,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => resolve(true)
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {resolve(false)}
                }
            },
            default: "cancel",
            close: () => {resolve(false)}
            }).render(true);
        });
        useFeat = await dialog;
		if (!useFeat) return;
        Hooks.once("dnd5e.preUseItem", (item, config, options) => {
            options.configureDialog = false;
            return true;
        });
        Hooks.once("dnd5e.preItemUsageConsumption", (item, config, options) => {
            config.consumeUsage = false;
            return true;
        });
		await usesItem.update({"system.uses.value": Math.max(0, usesItem.system.uses.value - 5)});
    } else if (args[0].macroPass == "preCheckHits" && args[0].attackRoll.terms[0].total < 10) {
        args[0].attackRoll._total += 10 - args[0].attackRoll.terms[0].total;
        args[0].attackRoll.terms[0]._total = 10;
        args[0].attackRoll.terms[0].formula = args[0].attackRoll.terms[0].formula.replace("d20", "d20min10");
        args[0].attackRoll._formula = args[0].attackRoll._formula.replace("d20", "d20min10");
        await args[0].workflow.setAttackRoll(args[0].attackRoll);
    } else if (args[0].macroPass == "preAttackRollComplete") {
        console.error("preAttackRollComplete")
        // TODO WHEN AVAILABLE
    }
} catch (err)  {console.error("Trance of Order Macro - ", err)}