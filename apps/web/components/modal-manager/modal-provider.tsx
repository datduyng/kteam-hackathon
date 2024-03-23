import React, { useCallback, useReducer, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ModalsContext,
  ModalSettings,
  ConfirmLabels,
  OpenConfirmModal,
  OpenContextModal,
  ContextModalProps,
  ModalsContextProps,
} from "./context";
import { ConfirmModal } from "./ConfirmModal";
import { modalsReducer } from "./reducer";
import { useModalsEvents } from "./events";
import { cn } from "@/lib/utils";
import { typeid } from 'typeid-js'

const v4 = () => typeid('modal').toString();

export interface ModalsProviderProps {
  /** Your app */
  children: React.ReactNode;

  /** Predefined modals */
  modals?: Record<string, React.FC<ContextModalProps<any>>>;

  /** Shared Modal component props, applied for every modal */
  modalProps?: ModalSettings;

  /** Confirm modal labels */
  labels?: ConfirmLabels;
}

function separateConfirmModalProps(props: OpenConfirmModal) {
  if (!props) {
    return { confirmProps: {}, modalProps: {} };
  }

  const {
    id,
    children,
    onCancel,
    onConfirm,
    closeOnConfirm,
    closeOnCancel,
    cancelProps,
    confirmProps,
    groupProps,
    labels,
    ...others
  } = props;

  return {
    confirmProps: {
      id,
      children,
      onCancel,
      onConfirm,
      closeOnConfirm,
      closeOnCancel,
      cancelProps,
      confirmProps,
      groupProps,
      labels,
    },
    modalProps: {
      id,
      ...others,
    },
  };
}

export function ModalsProvider({
  children,
  modalProps,
  labels,
  modals,
}: ModalsProviderProps) {
  const [state, dispatch] = useReducer(modalsReducer, {
    modals: [],
    current: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const closeAll = useCallback(
    (canceled?: boolean) => {
      dispatch({ type: "CLOSE_ALL", canceled });
    },
    [stateRef, dispatch]
  );

  const openModal = useCallback(
    ({ modalId, ...props }: ModalSettings) => {
      const id = modalId || v4();

      dispatch({
        type: "OPEN",
        modal: {
          id,
          type: "content",
          props,
        },
      });
      return id;
    },
    [dispatch]
  );

  const openConfirmModal = useCallback(
    ({ modalId, ...props }: OpenConfirmModal) => {
      const id = modalId || v4();
      dispatch({
        type: "OPEN",
        modal: {
          id,
          type: "confirm",
          props,
        },
      });
      return id;
    },
    [dispatch]
  );

  const openContextModal = useCallback(
    (modal: string, { modalId, ...props }: OpenContextModal) => {
      const id = modalId || v4();
      dispatch({
        type: "OPEN",
        modal: {
          id,
          type: "context",
          props,
          ctx: modal,
        },
      });
      return id;
    },
    [dispatch]
  );

  const closeModal = useCallback(
    (id: string, canceled?: boolean) => {
      dispatch({ type: "CLOSE", modalId: id, canceled });
    },
    [stateRef, dispatch]
  );

  useModalsEvents({
    openModal,
    openConfirmModal,
    openContextModal: ({ modal, ...payload }) =>
      openContextModal(modal, payload),
    closeModal,
    closeContextModal: closeModal,
    closeAllModals: closeAll,
  });

  const ctx: ModalsContextProps = {
    modals: state.modals,
    openModal,
    openConfirmModal,
    openContextModal,
    closeModal,
    closeContextModal: closeModal,
    closeAll,
  };

  const getCurrentModal = () => {
    const currentModal = stateRef.current.current;
    switch (currentModal?.type) {
      case "context": {
        const { innerProps, ...rest } = currentModal.props;
        const ContextModal = modals?.[(currentModal as any).ctx];

        return {
          modalProps: rest,
          content: (
            // @ts-ignore
            <ContextModal
              innerProps={innerProps}
              context={ctx}
              id={currentModal.id}
            />
          ),
        };
      }
      case "confirm": {
        const {
          modalProps: separatedModalProps,
          confirmProps: separatedConfirmProps,
        } = separateConfirmModalProps(currentModal.props);

        return {
          modalProps: separatedModalProps,
          content: (
            <ConfirmModal
              {...separatedConfirmProps}
              id={currentModal.id}
              labels={currentModal.props.labels || labels}
            />
          ),
        };
      }
      case "content": {
        const { children: currentModalChildren, ...rest } =
          currentModal.props as any;

        return {
          modalProps: rest,
          content: <>{currentModalChildren}</>,
        };
      }
      default: {
        return {
          modalProps: {},
          content: null,
        };
      }
    }
  };

  const { modalProps: currentModalProps, content } = getCurrentModal();

  return (
    <ModalsContext.Provider value={ctx}>
      <Dialog
        // zIndex={getDefaultZIndex('modal') + 1}
        {...modalProps}
        {...currentModalProps}
        test-compid="testing"
        className="w-[800px]"
        open={state.modals.length > 0}
        onOpenChange={() => closeModal((state.current as any)?.id)}
      >
        <DialogContent
          className={cn(
            currentModalProps.className
              ? currentModalProps.className
              : "flex h-[450px] flex-col justify-between sm:max-w-[425px]"
          )}
        >
          {content}
        </DialogContent>
      </Dialog>

      {children}
    </ModalsContext.Provider>
  );
}
