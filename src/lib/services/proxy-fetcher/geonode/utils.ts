import { GatewayCountry, ProxySourceType, PythonProxyOtions, SessionType } from "./types";
import { getRandomElement, getRandomValueFromEnum } from "../../../../utils/array";
import { supportedCountries } from "./constants";

export function getRandomProxyOptions(): PythonProxyOtions {
    const ipSourceType = getRandomValueFromEnum(ProxySourceType);
    const country = getRandomElement(supportedCountries);
    const sessionType = getRandomValueFromEnum(SessionType);
    const lifetime = Math.floor(Math.random() * 10) + 1;
    const gateway = getRandomValueFromEnum(GatewayCountry);

    return {
        country,
        ip_source_type: ipSourceType as ProxySourceType,
        session_type: sessionType as SessionType,
        lifetime,
        gateway: gateway as GatewayCountry
    };
}