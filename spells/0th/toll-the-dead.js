try {
    if (args[0].macroPass != "preDamageRollStarted" || args[0].targets[0].actor.system?.attributes?.hp?.value >= args[0].targets[0].actor.system?.attributes?.hp?.max) return;
    let damageFormula = args[0].damageRoll.formula;
    let newDamageFormula = damageFormula.replaceAll("d8", "d12");
    let newDamageRoll = await new Roll(newDamageFormula).roll();
    await args[0].workflow.setDamageRoll(newDamageRoll);
    args[0].workflow.damageTotal = newDamageRoll.total;
} catch (err) {console.error(`Toll the Dead error`, err)}