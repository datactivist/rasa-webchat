import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PROP_TYPES } from 'constants';
import { addUserMessage, emitUserMessage, setButtons, toggleInputDisabled } from 'actions';
import Message from '../Message/index';

import './styles.scss';
import ThemeContext from '../../../../../../ThemeContext';

let chosenKeywords = []
const default_max_keywords = 8

class Keywords extends PureComponent {

  constructor(props) {

    chosenKeywords = []

    super(props);
    this.handleClick = this.handleClick.bind(this);

    const {
      message,
      getChosenReply,
      inputState,
      id
    } = this.props;

    const hint = message.get('hint');

    if (message.get('keywords') !== undefined && message.get("nb_max_keywords") !== undefined) {
      message.get('keywords')._capacity = Math.min(message.get("nb_max_keywords"), message.get('keywords').size)
    }
    else {
      message.get('keywords').size, message.get('keywords')._capacity = default_max_keywords
    }

  }

  handleClick(reply) {
    const {
      chooseReply,
      id
    } = this.props;

    const payload = reply.get('payload');
    const title = reply.get('title');
    chooseReply(payload, title, id);
  }

  handleNoneClick() {
    const {
      chooseReply,
      id
    } = this.props;

    console.log("clickety Updated!!!")
    chooseReply("/deny", "Aucun", 0, true)
  }

  renderKeywords(message, keywords, persit) {

    const { isLast, linkTarget, separateKeywords
    } = this.props;
    const { userTextColor, userBackgroundColor } = this.context;
    const keywordStyle = {
      color: userTextColor,
      backgroundColor: userBackgroundColor,
      borderColor: userBackgroundColor
    };

    return (
      <div>
        <Message message={message} />
        {separateKeywords && (<div className="rw-separator" />)}
        {(isLast || persit) && (
          <div className="rw-replies">
            {keywords.map((reply, index) => {
              if (reply) {
                let div_keywords = (
                  <div
                    key={index}
                    className={'rw-reply-mult'}
                    onClick={(e) => { e.stopPropagation(); this.handleClick(reply); }}
                    style={keywordStyle}
                    onMouseUp={e => e.stopPropagation()}
                  >
                    {reply.get('title')}
                  </div>
                );
                console.log(div_keywords)
                return div_keywords
              }
            })}
          </div>
        )}
        {
          <div
            className="rw-no-reply"
            onClick={(e) => { e.stopPropagation(); this.handleNoneClick() }}>
            Aucun
          </div>
        }
      </div>
    );
  }


  render() {

    const {
      message,
      getChosenReply,
      chooseReply,
      id
    } = this.props;
    const chosenReply = getChosenReply(id);
    chooseReply("", "", -1)
    if (message.get('keywords') !== undefined) {
      let textarea = document.getElementsByClassName("rw-new-message")[0]
      let keywords = cleanKeywordsList(message.get('keywords'))
      if (chosenReply && textarea) {
        if (!chosenKeywords.includes(chosenReply)) {
          chosenKeywords.push(chosenReply)
          if (chosenKeywords.length > 0) {
            textarea.value = chosenKeywords.join(" ")
          }
        }
        keywords = removeKeywords(keywords, chosenReply, message.get("nb_max_keywords"));
      }
      return this.renderKeywords(message, keywords, true);
    }
  }
}

function removeKeywords(keywords, keyword_name, nb_max_keywords) {

  if (nb_max_keywords === undefined) {
    nb_max_keywords = default_max_keywords
  }

  let output = keywords
  let keywords_list = []

  for (let i = 0; i < output._tail.array.length; i++) {
    if (keywords._tail.array[i]._root.entries[1][1] !== keyword_name) {
      keywords_list.push(keywords._tail.array[i]);
    }
    else {
      if (output._tail.array.length <= nb_max_keywords) {
        output.size -= 1
        output._capacity -= 1
      }
    }
  }
  output._tail.array = keywords_list
  return output
}

function cleanKeywordsList(keywords) {

  let keywords_list = []
  let output = keywords

  if (keywords._root) {
    for (let i = 0; i < keywords._root.array[0].array.length; i++) {
      keywords_list.push(keywords._root.array[0].array[i])
    }
  }

  if (keywords._tail) {
    for (let i = 0; i < keywords._tail.array.length; i++) {
      keywords_list.push(keywords._tail.array[i])
    }
  }

  output._root = null
  //output._tail.array = null
  output._tail.array = keywords_list

  return output

}

Keywords.contextType = ThemeContext;

const mapStateToProps = state => ({
  getChosenReply: id => state.messages.get(id).get('chosenReply'),
  inputState: state.behavior.get('disabledInput'),
  linkTarget: state.metadata.get('linkTarget')
});

const mapDispatchToProps = dispatch => ({
  toggleInputDisabled: () => dispatch(toggleInputDisabled()),
  chooseReply: (payload, title, id, isFinal = false) => {
    dispatch(setButtons(id, title));
    if (isFinal) {
      dispatch(addUserMessage(title));
      dispatch(emitUserMessage(payload));
      dispatch(toggleInputDisabled());
    }
  }
});

Keywords.propTypes = {
  getChosenReply: PropTypes.func,
  chooseReply: PropTypes.func,
  id: PropTypes.number,
  isLast: PropTypes.bool,
  message: PROP_TYPES.KEYWORDS,
  linkTarget: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Keywords);
