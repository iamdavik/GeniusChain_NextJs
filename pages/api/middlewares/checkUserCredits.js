import Settings from "../models/Settings";
import User from "../models/User";

export async function checkUserCredits(req, type) {
  const address = req.body.signerAddress;

  // get credits amount
  try {
    let error = new Error();
    // let isSuccess = true;

    let user = await User.findOne({ address });

    let { credits } = req.body.user;

    let settings = await Settings.findOne({});
    // console.log(credits, user);

    switch (type) {
      case "chat":
        if (parseInt(credits) < parseInt(settings.chatPrice)) {
          console.log("not enough");
          error.message = "Credits not enough";
          error.status = 400;
          throw error;
        }
        break;
      case "contract":
        if (parseInt(credits) < parseInt(settings.contractCreationPrice)) {
          console.log("not enough");
          error.message = "Credits not enough";
          error.status = 400;
          throw error;
        }
        break;
      case "audit":
        if (parseInt(credits) < parseInt(settings.auditPrice)) {
          console.log("not enough");
          error.message = "Credits not enough";
          throw error;
        }
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
