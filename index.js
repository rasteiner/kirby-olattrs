window.panel.plugin("rasteiner/olAttrs", {
  writerNodes: {
    orderedList: {
      get button() {
        return {
          id: this.name,
          icon: "list-numbers",
          label: window.panel.$t("toolbar.button.ol"),
          name: this.name,
          when: ["listItem", "bulletList", "orderedList", "paragraph"],
          separator: true
        };
      },

      commands({ type: listType, schema, utils }) {
        return {
          orderedList: () => {
            if(this.editor.activeNodes.includes('orderedList') === false) {
              console.log('hello', utils.toggleList(listType, schema.nodes.listItem))
              return utils.toggleList(listType, schema.nodes.listItem);
            }

            const {type, order} = this.editor.activeNodeAttrs.orderedList;
            const {editor} = this;

            // If I don't wrap this in a setTimeout,
            // the panel freaks out when I resize the window after the dialog is closed.
            // It throws an error from the k-dropdown-content::setPosition() function:
            // "Failed to execute 'showModal' on 'HTMLDialogElement': The element is not in a Document."
            setTimeout(() => panel.dialog.open({
              component: 'k-form-dialog',
              props: {
                fields: {
                  order: {
                    label: 'Start at',
                    type: 'number',
                  },
                  type: {
                    label: 'Type',
                    type: 'select',
                    options: [
                      {text: 'Decimal (1., 2., 3.)', value: '1'},
                      {text: 'Lowercase alpha (a., b., c.)', value: 'a'},
                      {text: 'Uppercase alpha (A., B., C.)', value: 'A'},
                      {text: 'Lowercase Roman (i., ii., iii.)', value: 'i'},
                      {text: 'Uppercase Roman (I., II., III.)', value: 'I'}
                    ]
                  },
                },
                value: {
                  order,
                  type: type || '1'
                }
              },
              on: {
                submit(data) {
                  panel.dialog.close();
                  editor.command("setOrderedListAttrs", data)
                }
              }
            }), 0);

            return false;
          },
          setOrderedListAttrs: (attrs) => (state, dispatch, view) => {
            const { type } = attrs;

            // if type is null, undefined or '', toggle (remove) the list
            if(!type) {
              return utils.toggleList(listType, schema.nodes.listItem)(state, dispatch, view);
            }

            const { tr } = state;
            const { selection } = state;
            const { from, to } = selection;
            const { orderedList } = schema.nodes;

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type === orderedList) {
                tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  ...attrs
                });
              }
            });

            if (tr.docChanged && dispatch) {
              dispatch(tr);
            }

            return false;
          }
        }
      },

      inputRules({ type, utils }) {
        return [
          utils.wrappingInputRule(
            /^(\d+)\.\s$/,
            type,
            (match) => ({ order: +match[1] }),
            (match, node) => node.childCount + node.attrs.order === +match[1]
          )
        ];
      },

      keys({ type, schema, utils }) {
        return {
          "Shift-Ctrl-9": utils.toggleList(type, schema.nodes.listItem)
        };
      },

      get name() {
        return "orderedList";
      },

      get schema() {
        return {
          attrs: {
            order: {
              default: 1
            },
            type: {
              default: null
            }
          },
          content: "listItem+",
          group: "block",
          parseDOM: [
            {
              tag: "ol",
              getAttrs: (dom) => ({
                type: dom.hasAttribute("type") ? dom.getAttribute("type") : null,
                order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1
              })
            }
          ],
          toDOM: (node) => {
            const opts = { };
            if(node.attrs.order !== 1) opts.start = node.attrs.order;
            if(node.attrs.type) opts.type = node.attrs.type;

            return ["ol", opts, 0];
          }
        };
      }
    }
  }
});
