try {
    if (args[0].workflow.destructiveWrath) {
        let newDamageRolls = args[0].workflow.damageRoll;
        let newBonusDamageRolls = args[0].workflow.bonusDamageRoll;
        newDamageRolls.terms.forEach(t => { 
            if (!t.faces || !["lightning", "thunder"].includes(t.flavor.toLowerCase())) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
        newBonusDamageRolls.terms.forEach(t => { 
            if (!t.faces || !["lightning", "thunder"].includes(t.flavor.toLowerCase())) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
        if (newDamageRolls) await args[0].workflow.setDamageRoll(newDamageRolls);
        if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRoll(newBonusDamageRolls);
    }
    if (args[0].macroPass != "preDamageRollComplete" || !["msak", "rsak", "save", "other"].includes(item.system.actionType) || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].damageRoll.terms.find(t => t.faces && ["lightning", "thunder"].includes(t.flavor.toLowerCase()))) return;
    const usesItem = args[0].actor.items.find(i => i.name.toLowerCase().includes("channel divinity") && i.system.uses.value);
    if (!usesItem) return;
    let dialog = new Promise((resolve) => {
        new Dialog({
        title: "Channel Divinity: Destructive Wrath",
        content: `
        <form id="use-form">
            <p>Expend a use of Channel Divinity to maximise Lightning/Thunder damage?</p>
            <p>(${usesItem.system.uses.value} uses of Channel Divinity Remaining)</p>
        </form>
        `,
        buttons: {
            confirm: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: () => {resolve(true)}
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
    let newDamageRolls = args[0].workflow.damageRoll;
    let newBonusDamageRolls = args[0].workflow.bonusDamageRoll;
    newDamageRolls.terms.forEach(t => { 
        if (!t.faces || !["lightning", "thunder"].includes(t.flavor.toLowerCase())) return;
        t.results.forEach(d => {
            if (d.result >= t.faces) return;
            Object.assign(d, { rerolled: true, active: false });
            t.results.push({ result: t.faces, active: true, hidden: true });
            r._total = r._evaluateTotal();
        });
    });
    newBonusDamageRolls.terms.forEach(t => { 
        if (!t.faces || !["lightning", "thunder"].includes(t.flavor.toLowerCase())) return;
        t.results.forEach(d => {
            if (d.result >= t.faces) return;
            Object.assign(d, { rerolled: true, active: false });
            t.results.push({ result: t.faces, active: true, hidden: true });
            r._total = r._evaluateTotal();
        });
    });
    if (newDamageRolls) await args[0].workflow.setDamageRoll(newDamageRolls);
    if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRoll(newBonusDamageRolls);
    await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
    args[0].workflow.destructiveWrath = false;
} catch (err) {console.error("Destructive Wrath Macro - ", err)}