try {
    if (args[0].macroPass != "postActiveEffects") return;
    let dialog = await new Promise((resolve) => {
        new Dialog({
            title: "The Third Eye",
            content: `
            <form id="use-form">
                <p>Choose a feature to gain until your next rest:</p>
                <div class="form-group">
                    <input type="checkbox" name="effectType" value="darkvision">
                    <p>You gain darkvision out to a range of 60 feet</p>
                </div>
                <div class="form-group">
                    <input type="checkbox" name="effectType" value="ethereal">
                    <p>You can see into the Ethereal Plane within 60 feet of you.</p>
                </div>
                <div class="form-group">
                    <input type="checkbox" name="effectType" value="read">
                    <p>You can read any language.</p>
                </div>
                <div class="form-group">
                    <input type="checkbox" name="effectType" value="invisibility">
                    <p>You can see invisible creatures and objects within 10 feet of you that are within line of sight.</p>
                </div>
            </form>
            <script>
                var limit = 1;
                $("input[type='checkbox'][name='effectType']").change(function() {
                    var bol = $("input[type='checkbox'][name='effectType']:checked").length >= limit;
                    $("input[type='checkbox'][name='effectType']").not(":checked").attr("disabled", bol);
                });
            </script>
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => { resolve($("input[type='checkbox'][name='effectType']:checked").val()) }
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
    let effectType = await dialog;
    if (!effectType) return;
    let effectData = {
        icon: args[0].item.img,
        origin: args[0].item.uuid,
        disabled: false,
        flags: { dae: { specialDuration: ["longRest", "shortRest"], disableIncapacitated: true } },
    };
    switch (effectType) {
        case "darkvision":
            effectData.name = "Darkvision";
            effectData.changes = [{ key: "system.attributes.senses.darkvision", mode: 4, value: "60", priority: "20" }];
            break;
        case "ethereal":
            effectData.name = "Ethereal Sight";
            effectData.changes = [{ key: "ATL.detectionModes.etherealSight.range", mode: 4, value: "60", priority: "20" }];
            break;
        case "":
            effectData.name = "Greater Comprehension";
            break;
        case "":
            effectData.name = "See Invisibility";
            effectData.changes = [{ key: "ATL.detectionModes.seeInvisibility.range", mode: 4, value: "10", priority: "20" }];
            break;
        default:
            break;
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
} catch (err)  {console.error("The Third Eye Macro - ", err)}