import { AttributeView } from "@/types/AttributeView";
import { LoggerService } from "./LoggerService";
import { getEmptyAVKeyAndValues } from "@/libs/getAVKeyAndValues";
import semver from "semver";
import ShowEmptyAttributesToggle from "@/components/ShowEmptyAttributesToggle.svelte";
import { mount } from "svelte";

const logger = new LoggerService("AttributeViewService");

export class AttributeViewService {
  static handlePrimaryKey(
    element: HTMLElement,
    blockId: string,
    showPrimaryKey: boolean
  ) {
    // logger.debug("handlePrimaryKey");
    const primaryKeyValueField = element.querySelectorAll(
      `[data-node-id='${blockId}'] [data-type='block']`
    );
    primaryKeyValueField.forEach((field) => {
      const fieldElement = field as HTMLElement;
      const colId = fieldElement.dataset?.colId;
      const row = field.closest(`[data-col-id='${colId}'].av__row`);
      if (showPrimaryKey) {
        row?.classList.remove("dpp-av-panel--hidden");
      } else {
        row?.classList.add("dpp-av-panel--hidden");
      }
    });
  }

  static adjustDOM(
    element: HTMLElement,
    blockId: string,
    avData: AttributeView[],
    showPrimaryKey: boolean,
    showEmptyAttributes: boolean
  ) {
    logger.addBreadcrumb(blockId, "adjustDOM");
    // logger.debug("adjustDOM", { showPrimaryKey, showEmptyAttributes });
    AttributeViewService.handlePrimaryKey(element, blockId, showPrimaryKey);

    AttributeViewService.handleEmptyAttributes(
      element,
      blockId,
      avData,
      showEmptyAttributes
    );

    AttributeViewService.addToggleShowEmptyAttributes(element, blockId);
    AttributeViewService.hideAvHeader(element);
    AttributeViewService.disableTemplateClicks(element);
  }

  static handleEmptyAttributes(
    element: HTMLElement,
    blockId: string,
    avData: AttributeView[],
    showEmptyAttributes: boolean
  ) {
    // logger.debug("handleEmptyAttributes");
    avData.forEach((table) => {
      const emptyKeyAndValues = getEmptyAVKeyAndValues(table.keyValues);
      emptyKeyAndValues.forEach((item) => {
        element
          .querySelectorAll(
            `[data-id='${blockId}'][data-col-id='${item.values[0].keyID}']`
          )
          .forEach((field) => {
            if (showEmptyAttributes) {
              field.classList.remove("dpp-av-col--empty");
            } else {
              field.classList.add("dpp-av-col--empty");
            }
          });
      });
    });
  }

  static hideAvHeader(element: HTMLElement) {
    element.querySelectorAll(".custom-attr__avheader").forEach((item) => {
      item.classList.add("dpp-av-panel--hidden");
    });
  }

  static disableTemplateClicks(element: HTMLElement) {
    if (semver.lt(window.siyuan.config.system.kernelVersion, "3.1.21")) {
      //     logger.debug(
      //     "Kernel version is below 3.1.21, disabling clicks on templates"
      //   );
      const templates = element.querySelectorAll("[data-type='template']");
      templates.forEach((template) => {
        template.setAttribute("data-type", "text");
        template.classList.add("dpp-av-panel--disabled");
      });
    }
  }

  /**
   * TODO only triggered once maybe?
   */
  static addToggleShowEmptyAttributes(
    container: HTMLElement,
    documentId: string
  ) {
    // First remove any existing toggle buttons
    container
      .querySelectorAll(".dpp-empty-attributes-toggle")
      .forEach((button) => {
        button.remove();
      });

    const addColumnButton = container.querySelectorAll(
      "[data-type='addColumn']"
    );
    addColumnButton.forEach((element) => {
      mount(ShowEmptyAttributesToggle, {
        target: container,
        anchor: element.nextSibling,
        props: {
          documentId,
        },
      });
    });
  }
}
