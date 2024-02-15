let workflow = MidiQOL.Workflow.getWorkflow(item.uuid);

// thrown mwak range check
(workflow.item.system.actionType == "rwak" || 5 * Math.floor(MidiQOL.computeDistance(workflow.token, [...workflow.targets][0], false) / 5) > (workflow.item.system.properties.rch ? 10 : 5) + (workflow.actor.flags?.["midi-qol"]?.range?.mwak ?? 0))

// class spell check
return ((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("className") || item.system.chatFlavor).toLowerCase().includes("className") || (!item.flags?.["tidy5e-sheet"]?.parentClass && !item.system.chatFlavor && ["prepared", "always"].includes(item.system?.preparation?.mode)));









