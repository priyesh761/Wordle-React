import React from 'react';
import '../css/grid.css'
function Grid({grid, rowIndex, columnIndex}) {

    let index=0;
    return (
        <div className='grid'>
            <div className="grid-container">
                {grid.map( (row, rindex) => 
                                    row.map( (ele, cindex) =>{
                                        return <div key={++index} id={index} data-row = {rindex} data-column = {cindex} 
                                                    className="grid-item card-wrapper" type='text' maxLength={1}>
                                                    <div className="card"> 
                                                        <div className="front">{ele}</div>
                                                    </div>
                                                </div>
                                    })
                        )
                }
            </div>
        </div>
    );
}

export default Grid;