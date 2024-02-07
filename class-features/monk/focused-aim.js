try {
    if (args[0].tag != "OnUse" || args[0].macroPass != "preCheckHits" || !args[0].attackRoll || args[0].isFumble || args[0].isCritical || !args[0].targets[0]?.actor || args[0].targets[0].actor.system.attributes.ac.value < args[0].attackRoll.total) return;
    const usesItem = args[0].actor.items.find(i => i.name == "Ki" && i.system.uses.value);
    if (!usesItem) return;
    let dialog = new Promise((resolve) => {
        new Dialog({
        title: "Focused Aim: Usage Configuration",
        content: `
        <form id="use-form">
            <p>Expend 1-3 Ki Points to add 2-6 to the attack roll? (Attack Total: ${args[0].workflow.attackRoll.total})</p>
            <p>(${usesItem.system.uses.value} Ki Remaining)</p>
        </form>
        `,
        buttons: {
            1: {
                icon: '<i class="fas fa-check"></i>',
                label: "1 Ki (+2)",
                callback: () => resolve(1)
            },
            2: {
                icon: '<i class="fas fa-check"></i>',
                label: "2 Ki (+4)",
                callback: () => resolve(2)
            },
            3: {
                icon: '<i class="fas fa-check"></i>',
                label: "3 Ki (+6)",
                callback: () => resolve(3)
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
    ki = await dialog;
    if (!ki) return;
    if (ki > usesItem.system.uses.value) return ui.notifications.warn("Not enough Ki Points remaining");
    let bonusRoll = await new Roll('0 + ' + `${2 * ki}`).evaluate({async: true});
    for (let i = 1; i < bonusRoll.terms.length; i++) {
        args[0].attackRoll.terms.push(bonusRoll.terms[i]);
    }
    args[0].attackRoll._total += bonusRoll.total;
    args[0].attackRoll._formula = args[0].attackRoll._formula + ' + ' + `${2 * ki}`;
    await args[0].workflow.setAttackRoll(args[0].attackRoll);
    await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - ki) });
} catch (err) {console.error("Ki: Focused Aim Macro - ", err)}