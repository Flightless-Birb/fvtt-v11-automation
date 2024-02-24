try {
    if (args[0].tag != "DamageBonus" || !["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) || !(game.combat?.round == 1 && game.combat.turn < Object.entries(game.combat.turns).find(t => t[1].tokenId == args[0].targets[0].id)[0])) return;
    const diceMult = args[0].isCritical ? 2 : 1;
    args[0].workflow.surpriseAttack = true;
    return { damageRoll: `${2 * diceMult}d6`, flavor: "Surprise Attack" }
} catch (err) {console.error("Surprise Attack Macro - ", err)}