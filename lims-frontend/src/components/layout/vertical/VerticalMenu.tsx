// Next Imports
import { useParams } from "next/navigation";

// MUI Imports
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import PerfectScrollbar from "react-perfect-scrollbar";

// Type Imports
import type { getDictionary } from "@/utils/getDictionary";
import type { VerticalMenuContextProps } from "@menu/components/vertical-menu/Menu";

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from "@menu/vertical-menu";
import CustomChip from "@core/components/mui/Chip";

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from "@menu/hooks/useVerticalNav";

// Styled Component Imports
import StyledVerticalNavExpandIcon from "@menu/styles/vertical/StyledVerticalNavExpandIcon";

// Style Imports
import menuItemStyles from "@core/styles/vertical/menuItemStyles";
import menuSectionStyles from "@core/styles/vertical/menuSectionStyles";
import PermissionGuard from "../../PermissionGuard";
import { can } from "@/helpers/permissionHelper";

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean;
  transitionDuration?: VerticalMenuContextProps["transitionDuration"];
};

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void;
};

const RenderExpandIcon = ({
  open,
  transitionDuration,
}: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon
    open={open}
    transitionDuration={transitionDuration}
  >
    <i className="tabler-chevron-right" />
  </StyledVerticalNavExpandIcon>
);

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme();
  const verticalNavOptions = useVerticalNav();
  const params = useParams();

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions;
  const { lang: locale } = params;

  const ScrollWrapper = isBreakpointReached ? "div" : PerfectScrollbar;

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: "bs-full overflow-y-auto overflow-x-hidden",
            onScroll: container => scrollMenu(container, false),
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true),
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon
            open={open}
            transitionDuration={transitionDuration}
          />
        )}
        renderExpandedMenuItemIcon={{
          icon: <i className="tabler-circle text-xs" />,
        }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
       
        <MenuItem
          href={`/${locale}/dashboard`}
          icon={<i className="tabler-smart-home" />}
          exactMatch={false}
          activeUrl="/dashboard"
        >
          {dictionary["navigation"].dashboards}
        </MenuItem>
        {can("all-content", "manage") && (  
          <MenuSection label={dictionary["navigation"].cms}>
            {can("banner", "read") && (
              <MenuItem
              href={`/${locale}/admin/banner`}
              icon={<i className="tabler-layout-collage" />} // Banner (Photo Icon)
              exactMatch={false}
              activeUrl="/admin/banner"
            >
              {dictionary["navigation"].banner}
            </MenuItem>
            )}
            {can("publication", "read") && (
              <MenuItem
              href={`/${locale}/admin/publication`}
              icon={<i className="tabler-news" />} // Publication (File Text Icon)
              exactMatch={false}
              activeUrl="/admin/publication"
            >
              {dictionary["navigation"].publication}
            </MenuItem>
            )}
            {/* {can("publication", "read") && ()} */}
            {can("event", "read") && (
              <MenuItem
              href={`/${locale}/admin/event`}
              icon={<i className="tabler-calendar-month" />} // Event (Calendar Icon)
              exactMatch={false}
              activeUrl="/admin/event"
            >
              {dictionary["navigation"].event}
            </MenuItem>
            )}
            {can("testimonial", "read") && (
              <MenuItem
              href={`/${locale}/admin/testimonial`}
              icon={<i className="tabler-user-question" />} // Testimonial (Users Icon)
              exactMatch={false}
              activeUrl="/admin/testimonial"
            >
              {dictionary["navigation"].testimonial}
            </MenuItem>
            )}
              
            {/* <MenuItem
              href={`/${locale}/admin/gallery`}
              icon={<i className="tabler-icon tabler-icon-photo" />} // Gallery (Photo Icon)
              exactMatch={false}
              activeUrl="/admin/gallery"
            >
              {dictionary["navigation"].gallery}
            </MenuItem> */}
            {/* <MenuItem
              href={`/${locale}/admin/form`}
              icon={<i className="tabler-icon tabler-icon-list" />} // Form (List Icon)
              exactMatch={false}
              activeUrl="/admin/form"
            >
              {dictionary["navigation"].form}
            </MenuItem> */}
            {/* <MenuItem
              href={`/${locale}/admin/pages`}
              icon={<i className="tabler-icon tabler-icon-book" />} // Pages (Book Icon)
              exactMatch={false}
              activeUrl="/admin/pages"
            >
              {dictionary["navigation"].pages}
            </MenuItem> */}
          </MenuSection>
        )}
      
          <MenuSection label={dictionary["navigation"].dms}>
          {can("all-content", "manage") && (
            <SubMenu
              label={dictionary["navigation"].masterData}
              icon={<i className="tabler-brand-databricks" />}
            >
              <MenuItem href={`/${locale}/admin/master/document-status`}>
                {dictionary["navigation"].documentStatus}
              </MenuItem>
              <MenuItem href={`/${locale}/admin/master/document-category`}>
                {dictionary["navigation"].documentCategory}
              </MenuItem>
              <MenuItem href={`/${locale}/admin/master/document-type`}>
                {dictionary["navigation"].documentType}
              </MenuItem>
            </SubMenu> 
          )}
          </MenuSection>
          {can("document-control", "read") && (
          <MenuItem
              href={`/${locale}/admin/document-internal`}
              icon={<i className="tabler-checklist" />}
              exactMatch={false}
              activeUrl="/admin/document-internal"
            >
              {dictionary["navigation"].internalDocument}
            </MenuItem>
          )}
          {can("document-control", "read") && (
            <MenuItem
              href={`/${locale}/admin/document-external`}
              icon={<i className="tabler-checklist" />}
              exactMatch={false}
              activeUrl="/admin/document-external"
            >
              {dictionary["navigation"].externalDocument}
            </MenuItem>
          )}
          {can("document-approval", "read") && (
          <MenuItem
              href={`/${locale}/admin/document-approval`}
              icon={<i className="tabler-checklist" />}
              exactMatch={false}
              activeUrl="/admin/document-approval"
            >
              {dictionary["navigation"].approvalDocument}
            </MenuItem>
           )}
        {can("master", "read") && (
        <MenuSection label={dictionary["navigation"].configuration}>
          {/* <MenuItem
            href={`/${locale}/admin/menu`}
            icon={<i className="tabler-icon tabler-icon-menu" />} // Menu (Menu Icon)
            exactMatch={false}
            activeUrl="/admin/menu"
          >
            {dictionary["navigation"].menus}
          </MenuItem>
          <MenuItem
            href={`/${locale}/admin/footer`}
            icon={<i className="tabler-icon tabler-icon-layout-footer" />} // Footer (Footer Icon)
            exactMatch={false}
            activeUrl="/admin/footer"
          >
            {dictionary["navigation"].footer}
          </MenuItem> */}
          {/* <MenuItem
            href={`/${locale}/admin/person`}
            icon={<i className="tabler-icon tabler-icon-user" />} // Person (User Icon)
            exactMatch={false}
            activeUrl="/admin/person"
          >
            {dictionary["navigation"].person}
          </MenuItem> */}
          {/* <MenuItem
            href={`/${locale}/admin/team`}
            icon={<i className="tabler-icon tabler-icon-users" />} // Team (Users Icon)
            exactMatch={false}
            activeUrl="/admin/team"
          >
            {dictionary["navigation"].team}
          </MenuItem> */}
            <MenuItem
              href={`/${locale}/admin/user-management`}
              icon={<i className="tabler-users" />} // User Management (User Icon)
              exactMatch={false}
              activeUrl="/admin/user-management"
            >
              {dictionary["navigation"].userManagement}
            </MenuItem>
            <MenuItem
              href={`/${locale}/admin/roles-management`}
              icon={<i className="tabler-shield-lock" />} // Roles Management (Shield Icon)
              exactMatch={false}
              activeUrl="/admin/roles-management"
            >
              {dictionary["navigation"].rolesManagement}
            </MenuItem>
            <MenuItem
              href={`/${locale}/admin/settings`}
              icon={<i className="tabler-settings" />} // Settings (Settings Icon)
              exactMatch={false}
              activeUrl="/admin/settings"
            >
              {dictionary["navigation"].settings}
            </MenuItem>
        </MenuSection>
        )}
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary)} />
      </Menu> */}
    </ScrollWrapper>
  );
};

export default VerticalMenu;
