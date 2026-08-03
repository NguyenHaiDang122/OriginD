import { useEffect, useState } from "react";
import devtoolsDetector from 'devtools-detector';

export default function DevToolsBounty() {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown) return;

    const listener = (isOpen: boolean) => {
      if (isOpen) {
        setHasShown(true);
        
        console.log(
          "%c Xin chào Developer!",
          "color: #10b981; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 0 #000;"
        );
        console.log(
          "%cNếu bạn phát hiện lỗ hổng bảo mật, vui lòng liên hệ đội ngũ OriginD qua support@origind.id.vn. Chúng tôi luôn trân trọng những đóng góp giúp sản phẩm an toàn hơn.\n\nIf you discover a security vulnerability, please report it to support@origind.id.vn. We truly appreciate your help in keeping OriginD secure.",
          "color: #38bdf8; font-size: 14px; line-height: 1.5;"
        );
      }
    };

    devtoolsDetector.addListener(listener);
    devtoolsDetector.launch();

    return () => {
      devtoolsDetector.removeListener(listener);
      devtoolsDetector.stop();
    };
  }, [hasShown]);

  return null;
}
