try {
    if (args[0].tag != "DamageBonus" || args[0].item.type != "spell" || args[0].item.system.actionType != "heal") return;
    let newDamageRolls = args[0].workflow.damageRolls;
    let newBonusDamageRolls = args[0].workflow.bonusDamageRolls;
    newDamageRolls.forEach(async r => {
        r.terms.forEach(t => { 
            if (!t.faces) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
    });
    newBonusDamageRolls.forEach(async r => {
        r.terms.forEach(t => { 
            if (!t.faces) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
    });
    if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
    if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
} catch (err) {console.error("Supreme Healing Macro - ", err)}