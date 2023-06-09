import Settings from "../models/Settings";
import User from "../models/User";

export async function spendUserCredits(req, type) {
  const address = req.body.signerAddress;

  // get credits amount
  try {
    let error = new Error();
    // let isSuccess = true;

    let user = req.body.user;
    let { credits } = req.body.user;

    let settings = await Settings.findOne({});

    switch (type) {
      case "chat":
        req.body.user.credits =
          parseInt(user.credits) - parseInt(settings.chatPrice);
        await req.body.user.save();
        break;
      case "contract":
        req.body.user.credits =
          parseInt(user.credits) - parseInt(settings.contractCreationPrice);
        await req.body.user.save();
        break;
      case "audit":
        req.body.user.credits =
          parseInt(user.credits) - parseInt(settings.auditPrice);
        await req.body.user.save();
        break;

      default:
        break;
    }
  } catch (error) {
    error.middlewareName = "checkUserCredits";
    error.name = "middleware";
    error.status = 400;
    throw error;
  }

  // console.log("found user ", user);
}
