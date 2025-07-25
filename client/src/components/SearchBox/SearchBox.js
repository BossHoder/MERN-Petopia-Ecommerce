import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductSuggestions } from '../../store/actions/productActions';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css';

const SearchBox = () => {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchBoxRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
                setSuggestions([]);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounce function to limit API calls
    const debounce = useCallback((func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }, []);

    const fetchSuggestions = useCallback(
        async (searchValue) => {
            if (searchValue.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                dispatch(fetchProductSuggestions(searchValue))
                    .then((result) => {
                        setSuggestions(result || []);
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        console.error('Error fetching suggestions:', error);
                        setSuggestions([]);
                        setIsLoading(false);
                    });
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setIsLoading(false);
            }
        },
        [dispatch],
    );

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [
        fetchSuggestions,
        debounce,
    ]);

    const handleChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        setSelectedIndex(-1);
        debouncedFetchSuggestions(value);
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setSuggestions([]);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (suggestion) => {
        setKeyword('');
        setSuggestions([]);
        // Điều hướng theo type
        if (suggestion.type === 'product') {
            navigate(`/product/${suggestion.slug}`);
        } else if (suggestion.type === 'category') {
            navigate(
                `/category/${suggestion.parentCategory?.slug || 'unknown'}/${suggestion.slug}`,
            );
        } else if (suggestion.type === 'parentCategory') {
            navigate(`/category/${suggestion.slug}`);
        }
    };

    return (
        <div className="search-box" ref={searchBoxRef}>
            <input
                value={keyword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, categories..."
                autoComplete="off"
            />
            {(suggestions.length > 0 || isLoading) && (
                <ul className="suggestion-list">
                    {isLoading ? (
                        <li className="loading-item">
                            <span>Searching...</span>
                        </li>
                    ) : (
                        suggestions.map((s, index) => (
                            <li
                                key={s.id}
                                className={selectedIndex === index ? 'selected' : ''}
                                onClick={() => handleSelect(s)}
                            >
                                {s.label} <span className="type">{s.type}</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
