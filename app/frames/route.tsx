import { Button } from "frames.js/next";
import { frames } from "./frames";
import { appURL, formatNumber } from "../utils";

interface State {
  lastFid?: string;
}

const frameHandler = frames(async (ctx) => {
  interface UserData {
    username: string;
    fid: string;
    profileImageUrl: string;
  }

  let userData: UserData | null = null;

  let error: string | null = null;
  let isLoading = false;

  const fetchUserData = async (fid: string) => {
    isLoading = true;
    try {
      const airstackUrl = `${appURL()}/api/farscore?userId=${encodeURIComponent(
        fid
      )}`;
      const airstackResponse = await fetch(airstackUrl);
      if (!airstackResponse.ok) {
        throw new Error(
          `Airstack HTTP error! status: ${airstackResponse.status}`
        );
      }
      const airstackData = await airstackResponse.json();

      if (
        airstackData.userData.Socials.Social &&
        airstackData.userData.Socials.Social.length > 0
      ) {
        const social = airstackData.userData.Socials.Social[0];
        userData = {
          username: social.profileName || "unknown",
          fid: social.userId || "N/A",
          profileImageUrl:
          social.profileImage || "",
        };
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };


  const extractFid = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let fid = parsedUrl.searchParams.get("userfid");

      console.log("Extracted FID from URL:", fid);
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
    console.log("Using requester FID:", fid);
  } else if (ctx.url) {
    fid = extractFid(ctx.url.toString());
    console.log("Extracted FID from URL:", fid);
  } else {
    console.log("No ctx.url available");
  }

  if (!fid && (ctx.state as State)?.lastFid) {
    fid = (ctx.state as State).lastFid ?? null;
    console.log("Using FID from state:", fid);
  }

  console.log("Final FID used:", fid);

  const shouldFetchData =
    fid && (!userData || (userData as UserData).fid !== fid);

  if (shouldFetchData && fid) {
    await Promise.all([fetchUserData(fid)]);
  }

  const maskstats = `https://app.masks.wtf/api/balance?fid${
    fid ? `=${fid}` : ""
  }`;
  const masksrank = `https://app.masks.wtf/api/rank?fid${
    fid ? `=${fid}` : ""
  }`;

  const maskstatsdata = (await fetch(maskstats));
  const maskstatsJSON = await maskstatsdata.json();
  const masksrankdata = (await fetch(masksrank));
  const masksrankJSON = await masksrankdata.json();
  
  const masksPrice = 0.00000982;

  const SplashScreen = () => (
    
      <img 
        src="https://i.imgur.com/0lT4XCb.png"
        tw="w-full h-full object-cover"
      />
     
  );

  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-full bg-pink-50 text-blue-800 relative z-auto overflow-visible">
        <div tw="flex flex-col flex-nowrap justify-center items-center box-border w-full sticky -z-50">
          <img
            src="https://i.imgur.com/qYTbNxG.png"
            tw="w-full h-full object-cover"
          />
        </div>
        <div tw="flex flex-col flex-nowrap justify-items-center items-center content-center box-border w-full absolute top-75">
          <div tw="flex flex-row flex-nowrap justify-start">
            <div tw="flex flex-row flex-nowrap justify-start">
              <img
                src={userData?.profileImageUrl}
                alt="Profile"
                tw="w-32 h-32 rounded-3 mr-4"
              />
            </div>
            <div tw="flex flex-col flex-nowrap justify-start">
              <div tw="flex flex-row flex-nowrap text-[#fff] text-[50px]">
                {userData?.username}
              </div>
              <div tw="flex flex-row flex-nowrap text-[#fff] text-[40px]">
                FID: {userData?.fid}
              </div>
            </div>
          </div>
        </div>
        <div tw="flex flex-col flex-nowrap justify-start items-start w-full text-[60px] absolute bottom-130 left-35 text-[#fff]">
        {formatNumber(maskstatsJSON.weeklyAllowance)}
        </div>
        <div tw="flex flex-col flex-nowrap justify-start items-start w-full text-[60px] absolute bottom-77 left-35 text-[#fff]">
          {formatNumber(maskstatsJSON.remainingAllowance)}
        </div>
        <div tw="flex flex-col flex-nowrap justify-start items-start w-full text-[60px] absolute bottom-10 left-35 text-[#fff]">
          {formatNumber(maskstatsJSON.masks)}
          <span tw="text-[50px] text-[#F7E470]">
           (${formatNumber(maskstatsJSON.masks * masksPrice)})
          </span>
        </div>
        <div tw="flex flex-col flex-nowrap justify-end items-end w-full text-[60px] absolute bottom-130 right-34 text-[#fff] text-right">
          #{masksrankJSON.rank}
        </div>
        <div tw="flex flex-col flex-nowrap justify-end items-end w-full text-[60px] absolute bottom-77 right-34 text-[#fff] text-right">
          ${masksPrice}
        </div>
      </div>
      
    );
  };
  const shareText = encodeURIComponent(
    userData
      ? `🎭 Check your MASKS STATS 🎭`
      : "🎭 Check your MASKS STATS 🎭"
  );

  // Change the url here
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://check-masks-stats-v95.vercel.app/frames${
    fid ? `?userfid=${fid}` : ""
  }`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check Masks
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check Masks
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen />,
    buttons: buttons,
    imageOptions: {
      aspectRatio:"1:1",
    },
    title: "Masks Stats Frame",
    description: "Use this frame to check your Masks Stats",
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
