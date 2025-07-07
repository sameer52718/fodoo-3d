import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useDispatch, useSelector } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";

const Navmenu = ({ menus }) => {
  const { userType } = useSelector((state) => state.auth);
  const router = useRouter();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const toggleSubmenu = (i) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const location = usePathname();
  const locationName = location.replace("/", "");

  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch();

  useEffect(() => {
    let submenuIndex = null;
    menus.forEach((item, i) => {
      if (!item.child) return;
      const found = item.child.some((ci) => ci.childlink === locationName);
      if (found) submenuIndex = i;
    });

    setActiveSubmenu(submenuIndex);
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [router, location]);

  const isAllowed = (roles) => roles?.includes(userType);

  const shouldRenderItem = (item) => {
    if (item.isHeadr) return true;
    if (item.allowedRoles && isAllowed(item.allowedRoles)) return true;
    if (item.child) {
      return item.child.some((child) => isAllowed(child.allowedRoles));
    }
    return false;
  };

  return (
    <ul>
      {menus.map((item, i) => {
        if (!shouldRenderItem(item)) return null;

        return (
          <li
            key={i}
            className={`single-sidebar-menu 
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
              ${location === item.link ? "menu-item-active" : ""}`}
          >
            {/* Only label */}
            {item.isHeadr && !item.child && <div className="menulabel">{item.title}</div>}

            {/* Simple Link */}
            {!item.child && !item.isHeadr && isAllowed(item.allowedRoles) && (
              <Link className="menu-link" href={item.link}>
                <span className="menu-icon flex-grow-0">
                  <Icon icon={item.icon} />
                </span>
                <div className="text-box flex-grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </Link>
            )}

            {/* Parent with Children */}
            {item.child && (
              <>
                <div
                  className={`menu-link ${activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"}`}
                  onClick={() => toggleSubmenu(i)}
                >
                  <div className="flex-1 flex items-start">
                    <span className="menu-icon">
                      <Icon icon={item.icon} />
                    </span>
                    <div className="text-box">{item.title}</div>
                  </div>
                  <div className="flex-0">
                    <div
                      className={`menu-arrow transform transition-all duration-300 ${
                        activeSubmenu === i ? " rotate-90" : ""
                      }`}
                    >
                      <Icon icon="heroicons-outline:chevron-right" />
                    </div>
                  </div>
                </div>

                <Submenu
                  activeSubmenu={activeSubmenu}
                  item={{
                    ...item,
                    child: item.child.filter((ci) => isAllowed(ci.allowedRoles)),
                  }}
                  i={i}
                  locationName={locationName}
                />
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default Navmenu;
